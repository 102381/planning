<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../config.php';

if (!$PDO) {
    http_response_code(500);
    die(json_encode(['error' => 'Database connection failed']));
}

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($method === 'GET' && $action === 'getEvents') {
    getEvents($PDO);
} elseif ($method === 'POST' && $action === 'addEvent') {
    addEvent($PDO);
} elseif ($method === 'POST' && $action === 'initializeEvents') {
    initializeEvents($PDO);
} elseif ($method === 'POST' && $action === 'clearAndInitialize') {
    clearAndInitialize($PDO);
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid action']);
}

function getEvents($pdo) {
    try {
        $stmt = $pdo->query("SELECT * FROM events ORDER BY event_date");
        $events = $stmt->fetchAll();
        
        $result = [];
        foreach ($events as $row) {
            $result[] = [
                'id' => $row['id'],
                'date' => $row['event_date'],
                'title' => $row['title']
            ];
        }
        
        echo json_encode($result);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Query failed: ' . $e->getMessage()]);
    }
}

function addEvent($pdo) {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['date']) || !isset($data['title'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing date or title']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("INSERT INTO events (event_date, title) VALUES (:date, :title)");
        $stmt->execute([
            ':date' => $data['date'],
            ':title' => $data['title']
        ]);
        
        echo json_encode([
            'success' => true,
            'id' => $pdo->lastInsertId(),
            'date' => $data['date'],
            'title' => $data['title']
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Insert failed: ' . $e->getMessage()]);
    }
}

function initializeEvents($pdo) {
    try {
        //check if events already exist
        $result = $pdo->query("SELECT COUNT(*) as count FROM events");
        $row = $result->fetch();
        
        if ($row['count'] > 0) {
            echo json_encode(['message' => 'Events already initialized']);
            return;
        }
        
        $vacations = [
            ['name' => 'Meivakantie', 'start' => '2026-04-18', 'end' => '2026-05-05'],
            ['name' => 'Goede vrijdag', 'start' => '2026-04-03', 'end' => '2026-04-03'],
            ['name' => 'Pasen', 'start' => '2026-04-05', 'end' => '2026-04-06'],
            ['name' => 'Herfstvakantie', 'start' => '2026-10-17', 'end' => '2026-10-25'],
            ['name' => 'Kerstvakantie', 'start' => '2026-12-19', 'end' => '2027-01-03'],
            ['name' => 'Voorjaarsvakantie', 'start' => '2027-02-20', 'end' => '2027-02-28'],
            ['name' => 'Pasen', 'start' => '2027-03-26', 'end' => '2027-03-29'],
            ['name' => 'Meivakantie', 'start' => '2027-04-24', 'end' => '2027-05-09'],
            ['name' => 'Pinksteren', 'start' => '2027-05-17', 'end' => '2027-05-17'],
            ['name' => 'Zomervakantie', 'start' => '2027-07-17', 'end' => '2027-08-29'],
        ];
        
        $specialWeeks = [
            ['name' => 'Project-week 3', 'start' => '2026-04-13', 'end' => '2026-04-17'],
            ['name' => 'Bootcamp 3', 'start' => '2026-04-20', 'end' => '2026-04-24'],
            ['name' => 'Snuffel-stage', 'start' => '2026-05-18', 'end' => '2026-06-22'],
            ['name' => 'Project-week 4', 'start' => '2026-06-15', 'end' => '2026-06-19'],
            ['name' => 'VEEGWEEK', 'start' => '2026-07-06', 'end' => '2026-07-10'],
            ['name' => 'laatste week', 'start' => '2026-07-13', 'end' => '2026-07-17'],
        ];
        
        $insertedCount = 0;
        $stmt = $pdo->prepare("INSERT INTO events (event_date, title) VALUES (:date, :title)");
        
        //vacations
        foreach ($vacations as $vacation) {
            $start = new DateTime($vacation['start']);
            $end = new DateTime($vacation['end']);
            
            while ($start <= $end) {
                $dateStr = $start->format('d/m/Y');
                $stmt->execute([':date' => $dateStr, ':title' => $vacation['name']]);
                $insertedCount++;
                $start->modify('+1 day');
            }
        }
        
       
        foreach ($specialWeeks as $week) {
            $start = new DateTime($week['start']);
            $end = new DateTime($week['end']);
            
            while ($start <= $end) {
                $dateStr = $start->format('d/m/Y');
                $stmt->execute([':date' => $dateStr, ':title' => $week['name']]);
                $insertedCount++;
                $start->modify('+1 day');
            }
        }
        
        //Online les
        $start = new DateTime('2026-01-01');
        $end = new DateTime('2027-12-31');
        
        while ($start <= $end) {
            if ($start->format('w') == 3) {
                $dateStr = $start->format('d/m/Y');
                $stmt->execute([':date' => $dateStr, ':title' => 'Online les']);
                $insertedCount++;
            }
            $start->modify('+1 day');
        }
        
        //Blink meetup
        $start = new DateTime('2026-01-01');
        while ($start <= $end) {
            if ($start->format('w') == 5) { // Friday
                $dateStr = $start->format('d/m/Y');
                $stmt->execute([':date' => $dateStr, ':title' => 'Blink meetup']);
                $insertedCount++;
            }
            $start->modify('+1 day');
        }
        
        echo json_encode(['success' => true, 'inserted' => $insertedCount]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Initialization failed: ' . $e->getMessage()]);
    }
}

function clearAndInitialize($pdo) {
    try {
        $pdo->query("DELETE FROM events");
        initializeEvents($pdo);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Clear failed: ' . $e->getMessage()]);
    }
}
?>
