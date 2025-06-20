// script.js
window.addEventListener("DOMContentLoaded", () => {
  const info = document.getElementById("lokasi-info");
  const teks = document.getElementById("lokasi-teks");

  info.style.display = "block";
  info.className = "alert alert-warning py-2 small";
  teks.textContent = "Mendeteksi lokasi...";

  navigator.geolocation.getCurrentPosition(function (pos) {
    document.getElementById("latitude").value = pos.coords.latitude;
    document.getElementById("longitude").value = pos.coords.longitude;
    info.className = "alert alert-success py-2 small";
    teks.textContent = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)} ✅`;
  }, function () {
    info.className = "alert alert-danger py-2 small";
    teks.innerHTML = "<small>❌ Lokasi belum tersedia. Aktifkan GPS Anda dan izinkan lokasi.</small>";
  });
});

document.getElementById("uploadForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const file = formData.get("foto");
  const kode = formData.get("kode");
  const petugas = formData.get("petugas");
  const latitude = formData.get("latitude");
  const longitude = formData.get("longitude");

  if (!latitude || !longitude) {
    return Swal.fire({ icon: 'error', title: '❌ GPS Tidak Terdeteksi', text: 'Aktifkan lokasi sebelum mengirim.' });
  }

  const compressed = await compressImage(file, 1024, 150 * 1024);
  const filename = `rmh_${kode}_${latitude}_${longitude}.jpg`;

  const data = { kode, petugas, latitude, longitude, filename, foto: compressed };

  if (navigator.onLine) {
    await uploadOfflineItem(data, form);
  } else {
    await saveOfflineData(data);
    Swal.fire({ icon: 'info', title: '📴 Offline', text: 'Data disimpan & akan dikirim saat online.' });
    form.reset();
    showOfflineTable();
  }
});

window.addEventListener("online", async () => {
  const items = await getAllOfflineData();
  for (const item of items) {
    await uploadOfflineItem(item);
    await deleteOfflineData(item.id);
  }
  showOfflineTable();
});

async function uploadOfflineItem(item, form = null) {
  const fd = new FormData();
  fd.append("kode", item.kode);
  fd.append("latitude", item.latitude);
  fd.append("longitude", item.longitude);
  fd.append("petugas", item.petugas);
  fd.append("foto", item.foto, item.filename);

  Swal.fire({
    title: '📤 Mengunggah...',
    html: '<div class="progress"><div id="upload-bar" class="progress-bar progress-bar-striped bg-success" style="width:0%">0%</div></div>',
    showConfirmButton: false,
    allowOutsideClick: false,
    width: '300px',
    didOpen: () => Swal.showLoading()
  });

  const xhr = new XMLHttpRequest();
  xhr.open("POST", "upload.php", true);

  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable) {
      const percent = Math.round((e.loaded / e.total) * 100);
      const bar = document.getElementById('upload-bar');
      if (bar) {
        bar.style.width = percent + "%";
        bar.textContent = percent + "%";
        if (percent === 100) {
          Swal.update({ html: '<div class="text-center"><div class="spinner-border text-warning"></div><br><small>Menyimpan ke server...</small></div>' });
        }
      }
    }
  };

  xhr.onload = () => {
    if (xhr.status === 200 && xhr.responseText.toLowerCase().includes("berhasil")) {
      Swal.fire({
        icon: 'success',
        html: '✅ Data berhasil dikirim!<br><small>Menutup dalam <b>3</b> detik...</small>',
        timer: 3000,
        didOpen: () => {
          const b = Swal.getHtmlContainer().querySelector('b');
          setInterval(() => b.textContent = Math.ceil(Swal.getTimerLeft() / 1000), 100);
        }
      });
      if (form) form.reset();
    } else {
      console.warn("Gagal:", xhr.responseText);
    }
  };

  xhr.onerror = () => console.error("Koneksi gagal.");

  xhr.send(fd);
}

async function showOfflineTable() {
  const data = await getAllOfflineData();
  const tbody = document.getElementById("offlineTable");
  tbody.innerHTML = "";

  if (data.length === 0) {
    tbody.innerHTML = "<tr><td colspan='4'>Tidak ada data offline.</td></tr>";
    return;
  }

  data.forEach((item, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${item.kode}</td>
      <td>${item.latitude}, ${item.longitude}</td>
      <td><button class="btn btn-sm btn-danger" onclick="deleteOffline(${item.id})">Hapus</button></td>
    `;
    tbody.appendChild(tr);
  });
}

async function deleteOffline(id) {
  await deleteOfflineData(id);
  showOfflineTable();
}
