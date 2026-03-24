<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

$servername = 'localhost';
$port = '3306';
$username = 'blink_102381';
$password = 'blink_102381';
$dbname = 'blink_102381';

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
