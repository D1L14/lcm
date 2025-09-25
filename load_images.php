<?php
session_start();

// Carica la configurazione delle directory dall'editor
$imageDirs = [
    'newsCarousel-caf' => 'images/novita',
    'newsCarousel-patronato' => 'images/novita',
    'assistenza' => 'images/service',
    'homecarousel' => 'images/homecarousel',
    'service' => 'images/service',
    'carousel_storia' => 'images/story',
];

function getImageDirForKey($key, $dirs) {
    foreach ($dirs as $k => $path) {
        if (stripos($key, $k) !== false) return $path;
    }
    return 'images';
}

// Gestione upload
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['newImage'])) {
    $fieldName = $_POST['fieldName'] ?? '';
    $dir = $_POST['dir'] ?? 'images';
    
    // Se abbiamo il nome del campo, usa la funzione per determinare la directory corretta
    if (!empty($fieldName)) {
        $dir = getImageDirForKey($fieldName, $imageDirs);
    }
    
    // sicurezza: blocca path traversal
    $dir = preg_replace('/\.\./', '', $dir);
    
    $base = __DIR__ . "/";
    $fullPath = $base . $dir;
    
    if (!is_dir($fullPath)) {
        mkdir($fullPath, 0755, true);
    }
    
    $file = $_FILES['newImage'];
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (in_array($file['type'], $allowedTypes) && $file['error'] === 0) {
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid() . '.' . $extension;
        $destination = $base . $dir . '/' . $filename;
        
        if (move_uploaded_file($file['tmp_name'], $destination)) {
            echo json_encode(['success' => true, 'filename' => $dir . '/' . $filename]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Errore nel caricamento']);
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'Tipo di file non supportato']);
    }
    exit;
}

// Caricamento galleria
if (!isset($_GET['dir'])) exit;

$dir = $_GET['dir'];

// sicurezza: blocca path traversal
$dir = preg_replace('/\.\./', '', $dir);


// percorso assoluto
$base = __DIR__ . "/";
$fullPath = $base . $dir;

// Normalizza il path e verifica che esista
if (!is_dir($fullPath)) {
    // Se la directory non esiste, prova a crearla
    if (!mkdir($fullPath, 0755, true)) {
        exit("<div class='upload-section'>
            <h3>Cartella non trovata: $dir</h3>
            <p>Impossibile creare la cartella. Verifica i permessi.</p>
            <input type='file' id='fileInput' accept='image/*' style='display:none'>
            <button onclick='document.getElementById(\"fileInput\").click()' class='upload-btn'>📁 Carica Immagine</button>
        </div>");
    }
}

$images = glob($fullPath . "/*.{jpg,jpeg,png,gif,webp}", GLOB_BRACE);

// Rimuovi duplicati
$images = array_unique($images);

// Debug: mostra informazioni sulla directory
echo "<!-- DEBUG: Directory richiesta: $dir -->";
echo "<!-- DEBUG: Path completo: $fullPath -->";
echo "<!-- DEBUG: Directory esiste: " . (is_dir($fullPath) ? 'SI' : 'NO') . " -->";

$images = glob($fullPath . "/*.{jpg,jpeg,png,gif,webp}", GLOB_BRACE);
echo "<!-- DEBUG: Immagini trovate: " . count($images) . " -->";
if (count($images) > 0) {
    echo "<!-- DEBUG: Prima immagine: " . $images[0] . " -->";
}

// Sezione upload
echo "<div class='upload-section'>
    <h3>Carica nuova immagine in: $dir</h3>
    <p><small>Path: $fullPath</small></p>
    <input type='file' id='fileInput' accept='image/*' style='display:none'>
    <button onclick='document.getElementById(\"fileInput\").click()' class='upload-btn'>📁 Carica Immagine</button>
    <div id='uploadProgress' style='display:none'>Caricamento...</div>
</div>";

// Galleria immagini esistenti
if (count($images) > 0) {
    echo "<div class='images-section'><h3>Immagini disponibili (" . count($images) . ")</h3>";
    foreach ($images as $img) {
        // calcola percorso relativo a partire dalla cartella del progetto
        $relPath = $dir . "/" . basename($img);
        $fileSize = round(filesize($img) / 1024, 1);
        
        echo "<div class='image-item'>
            <img src='" . htmlspecialchars($relPath) . "' alt='img' title='".basename($img)." ({$fileSize}KB)'>
            <div class='image-info'>
                <span class='filename'>" . basename($img) . "</span>
                <span class='filesize'>{$fileSize}KB</span>
            </div>
        </div>";
    }
    echo "</div>";
} else {
    echo "<div class='no-images'>
        <p>📷 Nessuna immagine trovata in questa cartella</p>
        <p>Carica la prima immagine usando il pulsante sopra!</p>
    </div>";
}
