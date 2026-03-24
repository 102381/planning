<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);


$envFile = __DIR__ . '/planning/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            putenv("$key=$value");
        }
    }
}

$servername = 'localhost';
$port = '3306';
$username = getenv('USERNAME');
$password = getenv('PASSWORD');
$dbname = getenv('DBNAME');

$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false
];

$PDO = null;

try {
    $PDO = new PDO("mysql:host=$servername;port=$port;dbname=$dbname", $username, $password, $options);
} catch (PDOException $e) {
    error_log("Database connection failed: " . $e->getMessage());
}
?>
