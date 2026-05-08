/**
 * Code.gs - Logika Server Google Apps Script
 * Database: Google Spreadsheet (Sheet: Data_Pemilih, Kandidat, Admin)
 */

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('E-Voting Ketua RT 2026')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

const SS_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function getData() {
  const ss = SpreadsheetApp.openById(SS_ID);
  
  // Ambil Data Kandidat
  const candidateSheet = ss.getSheetByName('Kandidat');
  const candidateData = candidateSheet.getDataRange().getValues().slice(1);
  const candidates = candidateData.map(row => ({
    no: row[0],
    nama: row[1],
    visi: row[2],
    misi: row[3],
    foto: row[4],
    suara: row[5]
  }));

  // Hitung Statistik
  const voterSheet = ss.getSheetByName('Data_Pemilih');
  const totalVoters = voterSheet.getLastRow() - 1;
  const suaraMasuk = candidates.reduce((sum, c) => sum + c.suara, 0);

  // Ambil Logs (5 terakhir)
  const logs = voterSheet.getDataRange().getValues()
    .slice(1)
    .filter(row => row[2] === 'Sudah')
    .sort((a, b) => new Date(b[3]) - new Date(a[3]))
    .slice(0, 5)
    .map(row => ({
      waktu: Utilities.formatDate(new Date(row[3]), "GMT+7", "dd MMM yyyy, HH:mm"),
      nama: row[0],
      tps: "TPS 01", // Placeholder
      metode: "E-Voting",
      status: "Berhasil"
    }));

  return {
    candidates,
    logs,
    stats: {
      totalVoters: totalVoters, // Anda bisa ubah ini jadi angka statis jika di sheet hanya sample
      totalCandidates: candidates.length,
      suaraMasuk: suaraMasuk,
      partisipasi: totalVoters > 0 ? ((suaraMasuk / totalVoters) * 100).toFixed(2) + "%" : "0%"
    }
  };
}

function loginUser(nik) {
  const ss = SpreadsheetApp.openById(SS_ID);
  const sheet = ss.getSheetByName('Data_Pemilih');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1].toString() === nik.toString()) {
      if (data[i][2] === 'Sudah') {
        throw new Error("Anda sudah menggunakan hak suara Anda.");
      }
      return { nama: data[i][0], nik: data[i][1] };
    }
  }
  throw new Error("NIK tidak terdaftar dalam DPT.");
}

function submitVote(nik, candidateNo) {
  const ss = SpreadsheetApp.openById(SS_ID);
  const voterSheet = ss.getSheetByName('Data_Pemilih');
  const candidateSheet = ss.getSheetByName('Kandidat');
  
  // Update Status Pemilih
  const voterData = voterSheet.getDataRange().getValues();
  let foundVoter = false;
  for (let i = 1; i < voterData.length; i++) {
    if (voterData[i][1].toString() === nik.toString()) {
      if (voterData[i][2] === 'Sudah') throw new Error("Suara sudah terekam sebelumnya.");
      voterSheet.getRange(i + 1, 3).setValue('Sudah');
      voterSheet.getRange(i + 1, 4).setValue(new Date());
      foundVoter = true;
      break;
    }
  }

  if (!foundVoter) throw new Error("Pemilih tidak ditemukan.");

  // Update Jumlah Suara Kandidat
  const candData = candidateSheet.getDataRange().getValues();
  for (let j = 1; j < candData.length; j++) {
    if (candData[j][0].toString() === candidateNo.toString()) {
      const currentVote = candData[j][5] || 0;
      candidateSheet.getRange(j + 1, 6).setValue(currentVote + 1);
      break;
    }
  }

  return true;
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
