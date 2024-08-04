const whitelist = {
  'topa12dewa': 'User1',
  'JONI HARMONI': 'User2',
  'dendengsapi': 'User3',
  'lanciao': 'User4',
  'tuyuljelek': 'User5'
};

function isWhitelisted(keyword) {
  return whitelist.hasOwnProperty(keyword);
}

document.getElementById('whitelistButton').addEventListener('click', function() {
  const keyword = document.getElementById('whitelistInput').value.trim();
  if (isWhitelisted(keyword)) {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
  } else {
    alert('Kata kunci tidak valid!');
  }
});

// Fungsi untuk membaca dan menampilkan isi file teks ke textarea
document.getElementById('txtFileInput').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const content = e.target.result;
      document.getElementById('fileContent').value = content;
    };
    reader.readAsText(file);
  }
});

// Fungsi untuk menghitung kontak dalam textarea
function countContacts(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  return lines.length;
}

// Fungsi untuk memastikan nomor telepon dimulai dengan +
function formatPhoneNumber(number) {
  return number.startsWith('+') ? number : `+${number}`;
}

// Fungsi untuk mengkonversi file teks ke VCF
document.getElementById('convertButton').addEventListener('click', function() {
  const text = document.getElementById('fileContent').value.trim();
  const fileName = document.getElementById('convertFileNameInput').value.trim() || 'output';
  const contactName = document.getElementById('contactNameInput').value.trim() || 'Contact';

  if (!text) {
    alert('Isi textarea tidak boleh kosong!');
    return;
  }

  const contacts = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  let vcfContent = '';
  contacts.forEach((contact, index) => {
    const formattedContact = formatPhoneNumber(contact);
    vcfContent += `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName}${index + 1}\nTEL:${formattedContact}\nEND:VCARD\n`;
  });

  const blob = new Blob([vcfContent], { type: 'text/vcard' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}.vcf`;
  link.textContent = `Unduh ${fileName}.vcf`;
  link.classList.add('locked');
  link.setAttribute('data-price', 3000); // Harga per file 3000 IDR

  // Log activity
  logActivity('Mengkonversi file teks ke VCF');

  // Menampilkan file yang dikonversi
  const convertedFilesBox = document.getElementById('convertedTxtToVcfFiles');
  convertedFilesBox.appendChild(link);
});

// Fungsi untuk mengkonversi file VCF ke TXT
document.getElementById('vcfToTxtButton').addEventListener('click', function() {
  const file = document.getElementById('vcfToTxtFileInput').files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const content = e.target.result;
      const phoneNumbers = content.match(/TEL:(.+)/g)
        .map(line => line.replace('TEL:', '').trim())
        .map(number => formatPhoneNumber(number))
        .join('\n');

      const blob = new Blob([phoneNumbers], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'converted.txt';
      link.textContent = 'Unduh converted.txt';
      link.classList.add('locked');
      link.setAttribute('data-price', 3000); // Harga per file 3000 IDR

      // Log activity
      logActivity('Mengkonversi file VCF ke TXT');

      // Menampilkan file yang dikonversi
      const convertedFilesBox = document.getElementById('convertedVcfToTxtFiles');
      convertedFilesBox.appendChild(link);
    };
    reader.readAsText(file);
  }
});

// Fungsi untuk memecah file VCF
document.getElementById('splitButton').addEventListener('click', function() {
  const file = document.getElementById('vcfFileInput').files[0];
  const contactsPerFile = parseInt(document.getElementById('contactsPerFile').value, 10);
  const fileName = document.getElementById('splitFileNameInput').value.trim() || 'split';

  if (!file || isNaN(contactsPerFile) || contactsPerFile <= 0) {
    alert('Masukkan file VCF dan jumlah kontak per file yang valid!');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const content = e.target.result;
    const contacts = content.split('END:VCARD').map(contact => contact.trim() + '\nEND:VCARD').filter(contact => contact.length > 10);

    if (contacts.length === 0) {
      alert('File VCF tidak berisi kontak yang valid!');
      return;
    }

    let fileIndex = 1;
    for (let i = 0; i < contacts.length; i += contactsPerFile) {
      const chunk = contacts.slice(i, i + contactsPerFile).join('\n');

      const blob = new Blob([chunk], { type: 'text/vcard' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${fileName}_${fileIndex}.vcf`;
      link.textContent = `Unduh ${fileName}_${fileIndex}.vcf`;
      link.classList.add('locked');
      link.setAttribute('data-price', 3000); // Harga per file 3000 IDR

      // Log activity
      logActivity('Memecah file VCF');

      // Menampilkan file yang dibagi
      const splitFilesBox = document.getElementById('splitVcfFiles');
      splitFilesBox.appendChild(link);

      fileIndex++;
    }
  };
  reader.readAsText(file);
});

// Fungsi untuk menggabungkan file TXT
document.getElementById('mergeButton').addEventListener('click', function() {
  const files = document.getElementById('txtFilesInput').files;
  const fileName = document.getElementById('mergedFileNameInput').value.trim() || 'merged';

  if (files.length === 0) {
    alert('Pilih setidaknya satu file TXT untuk digabungkan!');
    return;
  }

  const readers = [];
  for (let i = 0; i < files.length; i++) {
    const reader = new FileReader();
    reader.readAsText(files[i]);
    readers.push(reader);
  }

  Promise.all(readers.map(reader => new Promise(resolve => {
    reader.onload = function(e) {
      resolve(e.target.result);
    };
  }))).then(contents => {
    const mergedContent = contents.join('\n');
    const blob = new Blob([mergedContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.txt`;
    link.textContent = `Unduh ${fileName}.txt`;
    link.classList.add('locked');
    link.setAttribute('data-price', 3000); // Harga per file 3000 IDR

    // Log activity
    logActivity('Menggabungkan file TXT');

    // Menampilkan file yang digabungkan
    const mergedFilesBox = document.getElementById('mergedTxtFiles');
    mergedFilesBox.appendChild(link);
  });
});

// Fungsi untuk memulai pembayaran
document.getElementById('payButton').addEventListener('click', function() {
  const links = document.querySelectorAll('a.locked');
  let totalAmount = 0;

  links.forEach(link => {
    totalAmount += parseInt(link.getAttribute('data-price'), 10);
  });

  if (totalAmount > 0) {
    // Tampilkan total pembayaran
    const paymentResult = document.getElementById('paymentResult');
    paymentResult.textContent = `Total pembayaran: Rp ${totalAmount.toLocaleString()}`;

    // Membuka aplikasi Dana dengan detail pembayaran
    openDanaPayment(totalAmount)
      .then(() => {
        alert('Silakan lakukan pembayaran di aplikasi Dana.');
      })
      .catch(error => {
        console.error('Terjadi kesalahan:', error);
        alert('Terjadi kesalahan dalam proses pembayaran.');
      });
  } else {
    alert('Tidak ada file yang dikunci untuk dibayar!');
  }
});

// Fungsi untuk membuka aplikasi Dana dengan detail pembayaran
function openDanaPayment(amount) {
  return new Promise((resolve, reject) => {
    // Format URL untuk membuka aplikasi Dana dengan nominal pembayaran
    const danaUrl = `dana://payment?amount=${amount}&currency=IDR&note=Pembayaran%20untuk%20file%20yang%20dikunci`;

    // Mencoba membuka aplikasi Dana
    window.location.href = danaUrl;

    // Timeout untuk memberikan waktu aplikasi Dana terbuka
    setTimeout(() => {
      // Cek jika pembayaran berhasil (simulasi, Anda bisa menggunakan API Dana untuk ini)
      resolve();
    }, 3000); // 3 detik waktu tunggu, bisa disesuaikan
  });
}

// Fungsi untuk mencatat aktivitas log
function logActivity(message) {
  console.log(`Aktivitas: ${message}`);
}
