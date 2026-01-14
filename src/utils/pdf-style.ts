import { StyleSheet } from '@react-pdf/renderer';

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoSection: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoBlock: {
    width: '45%',
  },
  boldText: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  text: {
    marginBottom: 3,
  },
  summarySection: {
    marginBottom: 20,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 5,
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 8,
  },
  tableCell: {
    fontSize: 9,
  },
  col1: { 
    width: '5%' 
  },
  col2: { 
    width: '45%' 
  },
  col3: { 
    width: '10%', 
    textAlign: 'right' 
  },
  col4: { 
    width: '15%', 
    textAlign: 'right' 
  },
  col5: { 
    width: '25%', 
    textAlign: 'right' 
  },
  itemDesc: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  itemDetail: {
    color: '#666',
    fontSize: 8,
    marginBottom: 2,
  },
  itemMeta: {
    color: '#999',
    fontSize: 7,
  },
  totalRow: {
    flexDirection: 'row',
    borderTopWidth: 2,
    borderTopColor: '#000',
    paddingTop: 8,
    fontWeight: 'bold',
  },
  totalsSection: {
    marginBottom: 20,
    borderTopWidth: 2,
    borderTopColor: '#000',
    paddingTop: 10,
  },
  totalsBox: {
    alignSelf: 'flex-end',
    width: '50%',
  },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 2,
    borderTopColor: '#000',
    marginTop: 5,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  paymentTable: {
    borderWidth: 1,
    borderColor: '#000',
  },
  paymentRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 8,
  },
  paymentCol1: { 
    width: '10%', 
    paddingHorizontal: 5, 
    borderRightWidth: 1, 
    borderRightColor: '#ddd' 
  },
  paymentCol2: { 
    width: '55%', 
    paddingHorizontal: 5, 
    borderRightWidth: 1, 
    borderRightColor: '#ddd' 
  },
  paymentCol3: { 
    width: '15%', 
    paddingHorizontal: 5, 
    textAlign: 'right', 
    borderRightWidth: 1, 
    borderRightColor: '#ddd' 
  },
  paymentCol4: { 
    width: '20%', 
    paddingHorizontal: 5, 
    textAlign: 'right' 
  },
  termsSection: {
    marginBottom: 20,
  },
  termItem: {
    marginBottom: 3,
    fontSize: 9,
  },
  acceptanceSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#000',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBlock: {
    width: '45%',
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginBottom: 8,
    paddingBottom: 2,
    minHeight: 15,
  },
  signatureBox: {
    borderWidth: 1,
    borderColor: '#000',
    height: 60,
    marginTop: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signatureImage: {
    maxHeight: 50,
    maxWidth: '100%',
  },
  footer: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#000',
    textAlign: 'center',
    fontSize: 9,
    color: '#666',
  },
});