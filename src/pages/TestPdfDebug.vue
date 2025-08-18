<template>
  <div class="pdf-debug-page p-8">
    <h1 class="text-2xl font-bold mb-4">PDF Debug Test</h1>
    
    <div class="mb-4">
      <label class="block mb-2">Contract Chat ID:</label>
      <input 
        v-model="contractId" 
        type="number" 
        class="border px-3 py-2 rounded w-64"
        placeholder="Enter contract chat ID"
      >
    </div>
    
    <button 
      @click="testStartExport" 
      class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
    >
      Test Start Export
    </button>
    
    <button 
      @click="testDirectAPI" 
      class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
    >
      Test Direct API Call
    </button>
    
    <div v-if="status" class="mt-4 p-4 bg-gray-100 rounded">
      <h3 class="font-bold">Status:</h3>
      <pre>{{ status }}</pre>
    </div>
    
    <div v-if="pdfData" class="mt-4">
      <h3 class="font-bold mb-2">PDF Preview:</h3>
      <div class="border p-4">
        <PdfViewer 
          :source="pdfData"
          :initial-scale="1"
          @loaded="onPdfLoaded"
          @error="onPdfError"
          class="h-[600px]"
        />
      </div>
    </div>
    
    <div v-if="errorDetails" class="mt-4 p-4 bg-red-100 rounded">
      <h3 class="font-bold text-red-700">Error Details:</h3>
      <pre class="text-sm">{{ errorDetails }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { startContractExport } from '@/apis/contractChatApi'
import PdfViewer from '@/components/common/PdfViewer.vue'
import api from '@/apis'

const contractId = ref(1)
const status = ref('')
const pdfData = ref(null)
const errorDetails = ref(null)

// Test using the contractChatApi function
const testStartExport = async () => {
  status.value = 'Testing startContractExport function...'
  errorDetails.value = null
  pdfData.value = null
  
  try {
    const response = await startContractExport(contractId.value)
    
    if (response) {
      status.value = `Success! Received ${response.byteLength} bytes`
      console.log('PDF Response:', response)
      
      // Display the PDF
      pdfData.value = response
    } else {
      status.value = 'Failed: No response data'
    }
  } catch (error) {
    status.value = 'Error occurred'
    errorDetails.value = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    }
    console.error('Error:', error)
  }
}

// Test with direct API call
const testDirectAPI = async () => {
  status.value = 'Testing direct API call...'
  errorDetails.value = null
  pdfData.value = null
  
  try {
    const response = await api.post(
      `/api/contract/${contractId.value}/start-export`, 
      null,
      {
        responseType: 'arraybuffer',
        headers: {
          'Accept': 'application/pdf'
        }
      }
    )
    
    status.value = `Direct API Success! Status: ${response.status}, Size: ${response.data.byteLength} bytes`
    console.log('Direct API Response:', response)
    
    // Check response headers
    console.log('Response Headers:', response.headers)
    
    // Display the PDF
    pdfData.value = response.data
  } catch (error) {
    status.value = `Direct API Error: ${error.response?.status || error.message}`
    errorDetails.value = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    }
    console.error('Direct API Error:', error)
  }
}

const onPdfLoaded = (data) => {
  console.log('PDF Loaded:', data)
  status.value += `\nPDF Loaded: ${data.numPages} pages`
}

const onPdfError = (error) => {
  console.error('PDF Error:', error)
  errorDetails.value = {
    ...errorDetails.value,
    pdfError: error.message
  }
}
</script>

<style scoped>
.pdf-debug-page {
  max-width: 1200px;
  margin: 0 auto;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>