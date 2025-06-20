<?php
if (!isset($_FILES['foto']) || !isset($_POST['kode'])) {
  die("Gagal: data tidak lengkap");
}

// Ambil data dari FormData
$fotoTmp = $_FILES['foto']['tmp_name'];
$fotoName = $_FILES['foto']['name'];
$kode = $_POST['kode'];
$latitude = $_POST['latitude'];
$longitude = $_POST['longitude'];
$petugas = $_POST['petugas'];

// Baca dan ubah jadi base64
$blob = file_get_contents($fotoTmp);
$base64 = base64_encode($blob);

// Buat nama file custom
$kodeBersih = preg_replace('/[^a-zA-Z0-9\-]/', '', $kode);
$namaFile = "rmh_" . $kodeBersih . "_" . $latitude . "_" . $longitude . ".jpg";

// Kirim ke Apps Script
$apps_script_url = 'https://script.google.com/macros/s/AKfycbxXr7Eq1plKvCILXIJFeYIZWAD4f9el9IG11DMs9i3C1IeyydpA7xHeg4L9vvmMWjQQ/exec';

$postData = [
  'kode' => $kode,
  'latitude' => $latitude,
  'longitude' => $longitude,
  'petugas' => $petugas,
  'filename' => $namaFile,
  'blob' => $base64
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apps_script_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$err = curl_error($ch);
curl_close($ch);

if ($err) {
  echo "cURL Error: $err";
} else {
  echo $response;
}
