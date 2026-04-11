import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { Download } from 'lucide-react'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: '#214aa6',
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#214aa6',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    backgroundColor: '#edf2fb',
    padding: '6 10',
    marginBottom: 4,
  },
  table: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  rowEven: {
    backgroundColor: '#f8fafc',
  },
  keyCell: {
    width: '35%',
    padding: '6 8',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: '#334155',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
  },
  valueCell: {
    width: '65%',
    padding: '6 8',
    fontSize: 9,
    color: '#475569',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#94a3b8',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
  },
})

function formatKey(key) {
  if (!key) return ''
  return key.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function flattenData(data, prefix = '') {
  const rows = []
  if (!data || typeof data !== 'object') return rows

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined || value === '') continue
    const label = prefix ? `${prefix} > ${formatKey(key)}` : formatKey(key)

    if (typeof value === 'object' && !Array.isArray(value)) {
      rows.push(...flattenData(value, label))
    } else if (Array.isArray(value)) {
      if (value.length === 0) continue
      const flat = value.map((v) =>
        typeof v === 'object' ? JSON.stringify(v) : String(v)
      ).join(', ')
      rows.push({ key: label, value: flat })
    } else {
      rows.push({ key: label, value: String(value) })
    }
  }
  return rows
}

function buildSections(data) {
  // If data has top-level object values, treat each as a section
  const sections = []

  if (!data || typeof data !== 'object') {
    return [{ title: 'Extracted Data', rows: [{ key: 'Output', value: String(data) }] }]
  }

  const topLevelObjects = Object.entries(data).filter(
    ([, v]) => v && typeof v === 'object' && !Array.isArray(v)
  )

  if (topLevelObjects.length > 0) {
    // Has nested sections
    for (const [key, value] of Object.entries(data)) {
      if (value === null || value === undefined) continue
      if (typeof value === 'object' && !Array.isArray(value)) {
        const rows = flattenData(value)
        if (rows.length > 0) sections.push({ title: formatKey(key), rows })
      } else if (Array.isArray(value)) {
        if (value.length === 0) continue
        const rows = value.map((v, i) => ({
          key: `Item ${i + 1}`,
          value: typeof v === 'object' ? JSON.stringify(v) : String(v),
        }))
        sections.push({ title: formatKey(key), rows })
      } else {
        // Scalar top-level value — add to a General section
        const existing = sections.find((s) => s.title === 'General')
        if (existing) {
          existing.rows.push({ key: formatKey(key), value: String(value) })
        } else {
          sections.push({ title: 'General', rows: [{ key: formatKey(key), value: String(value) }] })
        }
      }
    }
  } else {
    // Flat object — single section
    sections.push({ title: 'Extracted Data', rows: flattenData(data) })
  }

  return sections
}

function IntelliDocPDF({ fileName, documentType, data }) {
  const sections = buildSections(data)
  const generatedAt = new Date().toLocaleString()

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>IntelliDoc — Extracted Report</Text>
          <Text style={styles.subtitle}>
            File: {fileName}   |   Type: {documentType}   |   Generated: {generatedAt}
          </Text>
        </View>

        {/* Sections */}
        {sections.map((section, si) => (
          <View key={si} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.table}>
              {section.rows.map((row, ri) => (
                <View key={ri} style={[styles.row, ri % 2 === 0 ? styles.rowEven : {}]}>
                  <Text style={styles.keyCell}>{row.key}</Text>
                  <Text style={styles.valueCell}>{row.value}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by IntelliDoc — Intelligent Document Processing
        </Text>
      </Page>
    </Document>
  )
}

export default function PdfDownload({ fileName, documentType, data }) {
  if (!data) return null

  const safeFileName = (fileName || 'document').replace(/\.[^/.]+$/, '') + '_extracted.pdf'

  return (
    <PDFDownloadLink
      document={
        <IntelliDocPDF
          fileName={fileName || 'document'}
          documentType={documentType || 'Unknown'}
          data={data}
        />
      }
      fileName={safeFileName}
    >
      {({ loading }) => (
        <button
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-[#214aa6] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#17367c] disabled:opacity-60"
        >
          <Download className="h-4 w-4" />
          {loading ? 'Preparing PDF...' : 'Download PDF'}
        </button>
      )}
    </PDFDownloadLink>
  )
}
