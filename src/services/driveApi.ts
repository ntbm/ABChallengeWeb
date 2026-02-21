import { googleAuth } from './googleAuth'

const API_BASE = 'https://www.googleapis.com/drive/v3'
const UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3'

async function getHeaders(): Promise<HeadersInit> {
  const token = await googleAuth.ensureAuthenticated()
  return {
    Authorization: `Bearer ${token}`,
  }
}

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  modifiedTime?: string
}

export async function findFileByName(name: string, parentId?: string): Promise<DriveFile | null> {
  const headers = await getHeaders()
  
  let query = `name='${name}' and trashed=false`
  if (parentId) {
    query += ` and '${parentId}' in parents`
  }
  
  const response = await fetch(
    `${API_BASE}/files?q=${encodeURIComponent(query)}&spaces=drive&fields=files(id,name,mimeType,modifiedTime)`,
    { headers }
  )
  
  if (!response.ok) {
    throw new Error(`Failed to find file: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.files?.[0] || null
}

export async function createFolder(name: string, parentId?: string): Promise<DriveFile> {
  const headers = await getHeaders()
  
  const metadata = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
    ...(parentId && { parents: [parentId] }),
  }
  
  const response = await fetch(`${API_BASE}/files`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  })
  
  if (!response.ok) {
    throw new Error(`Failed to create folder: ${response.statusText}`)
  }
  
  return response.json()
}

export async function findOrCreateFolder(name: string): Promise<DriveFile> {
  const existing = await findFileByName(name)
  if (existing) {
    return existing
  }
  return createFolder(name)
}

export async function createFile(name: string, content: string, parentId: string): Promise<DriveFile> {
  const headers = await getHeaders()
  
  const metadata = {
    name,
    parents: [parentId],
  }
  
  const boundary = '-------314159265358979323846'
  const delimiter = `\r\n--${boundary}\r\n`
  const closeDelimiter = `\r\n--${boundary}--`
  
  const body = 
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    content +
    closeDelimiter
  
  const response = await fetch(
    `${UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime`,
    {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': `multipart/related; boundary="${boundary}"`,
      },
      body,
    }
  )
  
  if (!response.ok) {
    throw new Error(`Failed to create file: ${response.statusText}`)
  }
  
  return response.json()
}

export async function updateFile(fileId: string, content: string): Promise<void> {
  const headers = await getHeaders()
  
  const response = await fetch(
    `${UPLOAD_BASE}/files/${fileId}?uploadType=media`,
    {
      method: 'PATCH',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: content,
    }
  )
  
  if (!response.ok) {
    throw new Error(`Failed to update file: ${response.statusText}`)
  }
}

export async function getFileContent(fileId: string): Promise<string> {
  const headers = await getHeaders()
  
  const response = await fetch(
    `${API_BASE}/files/${fileId}?alt=media`,
    { headers }
  )
  
  if (!response.ok) {
    throw new Error(`Failed to get file content: ${response.statusText}`)
  }
  
  return response.text()
}

export async function uploadBlob(
  name: string, 
  blob: Blob, 
  parentId: string
): Promise<DriveFile> {
  const headers = await getHeaders()
  
  const metadata = {
    name,
    parents: [parentId],
  }
  
  const boundary = '-------314159265358979323846'
  const delimiter = `\r\n--${boundary}\r\n`
  const closeDelimiter = `\r\n--${boundary}--`
  
  const body = 
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${blob.type}\r\n\r\n`
  
  const encoder = new TextEncoder()
  const metadataBuffer = encoder.encode(body)
  const blobBuffer = await blob.arrayBuffer()
  const closeBuffer = encoder.encode(closeDelimiter)
  
  const combined = new Uint8Array(metadataBuffer.length + blobBuffer.byteLength + closeBuffer.length)
  combined.set(metadataBuffer, 0)
  combined.set(new Uint8Array(blobBuffer), metadataBuffer.length)
  combined.set(closeBuffer, metadataBuffer.length + blobBuffer.byteLength)
  
  const response = await fetch(
    `${UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime`,
    {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': `multipart/related; boundary="${boundary}"`,
      },
      body: combined,
    }
  )
  
  if (!response.ok) {
    throw new Error(`Failed to upload blob: ${response.statusText}`)
  }
  
  return response.json()
}

export async function deleteFile(fileId: string): Promise<void> {
  const headers = await getHeaders()
  
  const response = await fetch(`${API_BASE}/files/${fileId}`, {
    method: 'DELETE',
    headers,
  })
  
  if (!response.ok) {
    throw new Error(`Failed to delete file: ${response.statusText}`)
  }
}

export function getFileDownloadUrl(fileId: string): string {
  const token = googleAuth.getAccessToken()
  return `${API_BASE}/files/${fileId}?alt=media&access_token=${token}`
}
