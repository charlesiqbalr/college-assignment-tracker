import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

const htmlPath = path.join(rootDir, 'index.html');
const cssPath = path.join(rootDir, 'css/style.css');

describe('UI: HTML Semantic Structure and Accessibility Contract', () => {
  it('memastikan file index.html ada dan dapat dibaca', () => {
    assert.ok(fs.existsSync(htmlPath), 'index.html harus ada di root repository');
  });

  it('memverifikasi deklarasi doctype, atribut bahasa id, dan meta viewport responsif', () => {
    const html = fs.readFileSync(htmlPath, 'utf8');
    assert.match(html, /<!DOCTYPE\s+html>/i, 'Harus memiliki deklarasi <!DOCTYPE html>');
    assert.match(html, /<html[^>]*\blang=["']id["']/i, 'Atribut bahasa html harus berbahasa Indonesia (lang="id")');
    assert.match(html, /<meta[^>]*name=["']viewport["'][^>]*content=["'][^"']*width=device-width/i, 'Harus memiliki meta viewport responsif');
    assert.match(html, /<title>.*Tracker Tugas Kuliah.*<\/title>/i, 'Judul halaman harus memuat "Tracker Tugas Kuliah"');
    assert.match(html, /<link[^>]*rel=["']stylesheet["'][^>]*href=["']css\/style\.css["']/i, 'Harus menghubungkan stylesheet css/style.css');
  });

  it('mengimplementasikan elemen semantik utama (<header>, <main>, <section>) dengan heading yang tepat', () => {
    const html = fs.readFileSync(htmlPath, 'utf8');
    assert.match(html, /<header[\s>]/i, 'Harus memiliki elemen <header>');
    assert.match(html, /<h1[\s>][\s\S]*?Tracker Tugas Kuliah[\s\S]*?<\/h1>/i, 'Header harus memiliki <h1>Tracker Tugas Kuliah</h1>');
    assert.match(html, /<main[\s>]/i, 'Harus memiliki elemen semantik <main>');
    assert.match(html, /<section[^>]*aria-labelledby=["']form-heading["']/i, 'Harus memiliki <section aria-labelledby="form-heading">');
    assert.match(html, /<h2[^>]*id=["']form-heading["'][\s\S]*?>[\s\S]*?Tambah Tugas Baru[\s\S]*?<\/h2>/i, 'Harus memiliki <h2 id="form-heading">');
    assert.match(html, /<section[^>]*aria-labelledby=["']list-heading["']/i, 'Harus memiliki <section aria-labelledby="list-heading">');
    assert.match(html, /<h2[^>]*id=["']list-heading["'][\s\S]*?>[\s\S]*?Daftar Tugas[\s\S]*?<\/h2>/i, 'Harus memiliki <h2 id="list-heading">');
  });

  it('memverifikasi formulir #assignment-form dengan novalidate dan input lengkap beserta atribut aksesibilitas', () => {
    const html = fs.readFileSync(htmlPath, 'utf8');

    // Form
    assert.match(html, /<form[^>]*id=["']assignment-form["'][^>]*novalidate/i, 'Form harus memiliki id="assignment-form" dan atribut novalidate');

    // Input Judul
    assert.match(html, /<label[^>]*for=["']assignment-title["']/i, 'Label untuk assignment-title harus ada');
    assert.match(html, /<input[^>]*id=["']assignment-title["'][^>]*name=["']title["']/i, 'Input judul harus memiliki id="assignment-title" dan name="title"');
    assert.match(html, /<input[^>]*id=["']assignment-title["'][^>]*maxlength=["']100["']/i, 'Input judul harus memiliki maxlength="100"');
    assert.match(html, /<input[^>]*id=["']assignment-title["'][^>]*required/i, 'Input judul harus memiliki required');
    assert.match(html, /<input[^>]*id=["']assignment-title["'][^>]*aria-describedby=["']title-error["']/i, 'Input judul harus memiliki aria-describedby="title-error"');
    assert.match(html, /<span[^>]*id=["']title-error["'][^>]*class=["'][^"']*error-text[^"']*["'][^>]*aria-live=["']polite["']/i, 'Pesan galat judul harus ada dengan class="error-text" dan aria-live="polite"');

    // Input Mata Kuliah & Datalist
    assert.match(html, /<label[^>]*for=["']assignment-course["']/i, 'Label untuk assignment-course harus ada');
    assert.match(html, /<input[^>]*id=["']assignment-course["'][^>]*name=["']course["']/i, 'Input course harus memiliki id="assignment-course" dan name="course"');
    assert.match(html, /<input[^>]*id=["']assignment-course["'][^>]*maxlength=["']50["']/i, 'Input course harus memiliki maxlength="50"');
    assert.match(html, /<input[^>]*id=["']assignment-course["'][^>]*list=["']course-suggestions["']/i, 'Input course harus memiliki list="course-suggestions"');
    assert.match(html, /<input[^>]*id=["']assignment-course["'][^>]*required/i, 'Input course harus memiliki required');
    assert.match(html, /<input[^>]*id=["']assignment-course["'][^>]*aria-describedby=["']course-error["']/i, 'Input course harus memiliki aria-describedby="course-error"');
    assert.match(html, /<datalist[^>]*id=["']course-suggestions["'][\s\S]*?<\/datalist>/i, 'Elemen datalist #course-suggestions harus tersedia');
    assert.match(html, /<span[^>]*id=["']course-error["'][^>]*class=["'][^"']*error-text[^"']*["'][^>]*aria-live=["']polite["']/i, 'Pesan galat course harus ada dengan class="error-text" dan aria-live="polite"');

    // Input Tenggat Waktu
    assert.match(html, /<label[^>]*for=["']assignment-due-date["']/i, 'Label untuk assignment-due-date harus ada');
    assert.match(html, /<input[^>]*type=["']datetime-local["'][^>]*id=["']assignment-due-date["'][^>]*name=["']dueDate["']/i, 'Input tenggat harus bertipe datetime-local dengan id="assignment-due-date" dan name="dueDate"');
    assert.match(html, /<input[^>]*id=["']assignment-due-date["'][^>]*required/i, 'Input tenggat harus required');
    assert.match(html, /<input[^>]*id=["']assignment-due-date["'][^>]*aria-describedby=["']due-date-error["']/i, 'Input tenggat harus memiliki aria-describedby="due-date-error"');
    assert.match(html, /<span[^>]*id=["']due-date-error["'][^>]*class=["'][^"']*error-text[^"']*["'][^>]*aria-live=["']polite["']/i, 'Pesan galat due date harus ada dengan class="error-text" dan aria-live="polite"');

    // Input Prioritas
    assert.match(html, /<label[^>]*for=["']assignment-priority["']/i, 'Label untuk assignment-priority harus ada');
    assert.match(html, /<select[^>]*id=["']assignment-priority["'][^>]*name=["']priority["']/i, 'Select priority harus memiliki id="assignment-priority" dan name="priority"');
    assert.match(html, /<option[^>]*value=["']low["'][\s\S]*?>[\s\S]*?Rendah[\s\S]*?<\/option>/i, 'Opsi priority low (Rendah) harus ada');
    assert.match(html, /<option[^>]*value=["']medium["'][^>]*selected[\s\S]*?>[\s\S]*?Sedang[\s\S]*?<\/option>/i, 'Opsi priority medium (Sedang) harus terpilih secara default (selected)');
    assert.match(html, /<option[^>]*value=["']high["'][\s\S]*?>[\s\S]*?Tinggi[\s\S]*?<\/option>/i, 'Opsi priority high (Tinggi) harus ada');

    // Textarea Catatan
    assert.match(html, /<label[^>]*for=["']assignment-notes["']/i, 'Label untuk assignment-notes harus ada');
    assert.match(html, /<textarea[^>]*id=["']assignment-notes["'][^>]*name=["']notes["'][^>]*maxlength=["']500["']/i, 'Textarea notes harus memiliki id="assignment-notes", name="notes", dan maxlength="500"');

    // Tombol Submit
    assert.match(html, /<button[^>]*type=["']submit["'][^>]*id=["']submit-button["'][\s\S]*?>[\s\S]*?Simpan Tugas[\s\S]*?<\/button>/i, 'Tombol submit harus memiliki id="submit-button" dan teks "Simpan Tugas"');
  });

  it('memverifikasi toolbar filter dan pengurutan dengan kontrol yang tepat', () => {
    const html = fs.readFileSync(htmlPath, 'utf8');

    // Filter Status
    assert.match(html, /<label[^>]*for=["']filter-status["']/i, 'Label untuk filter-status harus ada');
    assert.match(html, /<select[^>]*id=["']filter-status["']/i, 'Select filter-status harus ada');
    assert.match(html, /<option[^>]*value=["']all["'][\s\S]*?>[\s\S]*?Semua[\s\S]*?<\/option>/i, 'Opsi filter status: all (Semua)');
    assert.match(html, /<option[^>]*value=["']pending["'][\s\S]*?>[\s\S]*?Belum Selesai[\s\S]*?<\/option>/i, 'Opsi filter status: pending (Belum Selesai)');
    assert.match(html, /<option[^>]*value=["']completed["'][\s\S]*?>[\s\S]*?Selesai[\s\S]*?<\/option>/i, 'Opsi filter status: completed (Selesai)');

    // Filter Course
    assert.match(html, /<label[^>]*for=["']filter-course["']/i, 'Label untuk filter-course harus ada');
    assert.match(html, /<select[^>]*id=["']filter-course["']/i, 'Select filter-course harus ada');
    assert.match(html, /<option[^>]*value=["']all["'][\s\S]*?>[\s\S]*?Semua Mata Kuliah[\s\S]*?<\/option>/i, 'Opsi awal filter-course: all (Semua Mata Kuliah)');

    // Sort By
    assert.match(html, /<label[^>]*for=["']sort-by["']/i, 'Label untuk sort-by harus ada');
    assert.match(html, /<select[^>]*id=["']sort-by["']/i, 'Select sort-by harus ada');
    assert.match(html, /<option[^>]*value=["']dueDate["'][\s\S]*?>[\s\S]*?Tenggat Waktu[\s\S]*?<\/option>/i, 'Opsi sort dueDate (Tenggat Waktu)');
    assert.match(html, /<option[^>]*value=["']priority["'][\s\S]*?>[\s\S]*?Tingkat Prioritas[\s\S]*?<\/option>/i, 'Opsi sort priority (Tingkat Prioritas)');
  });

  it('memverifikasi wadah daftar tugas dan indikator keadaan kosong (empty state)', () => {
    const html = fs.readFileSync(htmlPath, 'utf8');

    assert.match(
      html,
      /<ul[^>]*id=["']assignment-list["'][^>]*class=["'][^"']*\bassignment-list\b[^"']*["'][^>]*aria-live=["']polite["']/i,
      'Harus ada <ul id="assignment-list" class="assignment-list" aria-live="polite">'
    );
    assert.match(
      html,
      /<p[^>]*id=["']empty-state["'][^>]*class=["'][^"']*\bempty-state\b[^"']*["'][^>]*hidden[\s\S]*?>[\s\S]*?Tidak ada tugas yang ditemukan\.[\s\S]*?<\/p>/i,
      'Harus ada <p id="empty-state" class="empty-state" hidden>Tidak ada tugas yang ditemukan.</p>'
    );
  });
});

describe('UI: Visual Stylesheet & Indicator Classes Contract', () => {
  it('memastikan file css/style.css ada dan dapat dibaca', () => {
    assert.ok(fs.existsSync(cssPath), 'css/style.css harus ada di direktori css');
  });

  it('memverifikasi kelas penanda visual status tenggat waktu dan tugas selesai', () => {
    const css = fs.readFileSync(cssPath, 'utf8');

    // Urgency indicators
    assert.match(css, /\.due-status-overdue\b/, 'CSS harus mendefinisikan kelas .due-status-overdue');
    assert.match(css, /\.due-status-due-soon\b/, 'CSS harus mendefinisikan kelas .due-status-due-soon');
    assert.match(css, /\.badge-completed\b/, 'CSS harus mendefinisikan kelas .badge-completed');

    // Strikethrough style for completed tasks
    assert.match(css, /text-decoration:\s*line-through/, 'CSS harus memiliki styling teks coret (text-decoration: line-through) untuk tugas selesai');
  });

  it('memverifikasi kelas lencana prioritas (priority-high, priority-medium, priority-low)', () => {
    const css = fs.readFileSync(cssPath, 'utf8');

    assert.match(css, /\.priority-high\b/, 'CSS harus mendefinisikan kelas .priority-high');
    assert.match(css, /\.priority-medium\b/, 'CSS harus mendefinisikan kelas .priority-medium');
    assert.match(css, /\.priority-low\b/, 'CSS harus mendefinisikan kelas .priority-low');
  });

  it('memverifikasi aturan tata letak responsif menggunakan media queries', () => {
    const css = fs.readFileSync(cssPath, 'utf8');

    assert.match(css, /@media\s*\(/, 'CSS harus mendefinisikan setidaknya satu aturan @media untuk responsivitas');
  });
});
