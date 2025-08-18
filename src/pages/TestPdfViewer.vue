<template>
  <div class="test-pdf-viewer">
    <h1>PDF Viewer Test</h1>
    
    <div class="controls">
      <button @click="loadBase64Pdf" class="btn">Load Base64 PDF</button>
      <button @click="loadUrlPdf" class="btn">Load URL PDF</button>
    </div>
    
    <div v-if="pdfSource" class="pdf-container">
      <PdfViewer
        :source="pdfSource"
        :initial-scale="1"
        :show-thumbnails="false"
        @loaded="onPdfLoaded"
        @page-change="onPageChange"
        @error="onPdfError"
      />
    </div>
    
    <div v-if="status" class="status">
      {{ status }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PdfViewer from '@/components/common/PdfViewer.vue'

const pdfSource = ref(null)
const status = ref('')

// Test with a base64 PDF
const loadBase64Pdf = () => {
  // This is a minimal PDF for testing
  const base64Pdf = 'JVBERi0xLjMKJeLjz9MKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovT3V0bGluZXMgMiAwIFIKL1BhZ2VzIDMgMCBSCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9PdXRsaW5lcwovQ291bnQgMAo+PgplbmRvYmoKMyAwIG9iago8PAovVHlwZSAvUGFnZXMKL0NvdW50IDEKL0tpZHMgWzQgMCBSXQo+PgplbmRvYmoKNCAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDMgMCBSCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCi9Db250ZW50cyA1IDAgUgovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA2IDAgUgo+Pgo+Pgo+PgplbmRvYmoKNSAwIG9iago8PAovTGVuZ3RoIDQ0Cj4+CnN0cmVhbQpCVAovRjEgMjQgVGYKMTAwIDcwMCBUZAooSGVsbG8gV29ybGQpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKNiAwIG9iago8PAovVHlwZSAvRm9udAovU3VidHlwZSAvVHlwZTEKL0Jhc2VGb250IC9IZWx2ZXRpY2EKPj4KZW5kb2JqCnhyZWYKMCA3CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDc0IDAwMDAwIG4gCjAwMDAwMDAxMjAgMDAwMDAgbiAKMDAwMDAwMDE3MyAwMDAwMCBuIAowMDAwMDAwMzA2IDAwMDAwIG4gCjAwMDAwMDAzOTkgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA3Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0ODYKJSVFT0Y='
  
  pdfSource.value = `data:application/pdf;base64,${base64Pdf}`
  status.value = 'Loading base64 PDF...'
}

// Test with a URL PDF
const loadUrlPdf = () => {
  // Use a public PDF for testing
  pdfSource.value = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  status.value = 'Loading URL PDF...'
}

const onPdfLoaded = (data) => {
  status.value = `PDF loaded successfully! Pages: ${data.numPages}`
  console.log('PDF loaded:', data)
}

const onPageChange = (page) => {
  console.log('Page changed to:', page)
}

const onPdfError = (error) => {
  status.value = `Error loading PDF: ${error.message}`
  console.error('PDF error:', error)
}
</script>

<style scoped>
.test-pdf-viewer {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 20px;
}

.controls {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn:hover {
  background-color: #2563eb;
}

.pdf-container {
  height: 800px;
  border: 1px solid #ddd;
  border-radius: 5px;
  overflow: hidden;
}

.status {
  margin-top: 20px;
  padding: 10px;
  background-color: #f3f4f6;
  border-radius: 5px;
}
</style>