import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const sharedStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 48,
    paddingHorizontal: 20,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.secondary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border ?? '#ccc',
    backgroundColor: colors.inputBackground ?? '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  location: {
    fontSize: 12,
    color: colors.primary,
    maxWidth: 140,
  },
  dateText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 12,
    color: colors.text,
  },
  menuList: {
    paddingBottom: 40,
  },
    menuCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: colors.secondary,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
  },
  menuText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  menuDescription: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
  },
  locationSelector: {
  position: 'absolute',
  top: 100,
  left: 20,
  right: 20,
  backgroundColor: '#fff',
  padding: 16,
  borderRadius: 12,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 10,
  zIndex: 1000,
},

locationTitle: {
  fontWeight: 'bold',
  fontSize: 16,
  marginBottom: 12,
  color: colors.text,
},

locationOption: {
  paddingVertical: 10,
  borderBottomColor: '#eee',
  borderBottomWidth: 1,
  fontSize: 14,
  color: colors.text,
},

locationCancel: {
  marginTop: 10,
  textAlign: 'right',
  color: 'red',
  fontSize: 14,
},
  logoutText: {
    textAlign: 'center',
    color: colors.primary,
    marginTop: 12,
  },
  label: {
  fontSize: 16,
  fontWeight: '500',
  color: colors.text,
  marginBottom: 8,
  marginTop: 8,
},
pickerWrapper: {
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 10,
  marginBottom: 16,
  backgroundColor: colors.inputBackground,
},
priceBadge: {
  position: 'absolute',
  bottom: 12,
  right: 12,
  backgroundColor: colors.secondary,
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 6,
},
priceText: {
  color: '#fff',
  fontWeight: '600',
  fontSize: 12,
},
ratingRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 8,
  marginBottom: 4,
},

ratedText: {
  fontStyle: 'italic',
  color: 'gray',
  fontSize: 13,
  marginTop: 4,
},

ratePrompt: {
  fontSize: 14,
  color: colors.primary,
  fontWeight: '600',
  marginTop: 8,
  marginBottom: 4,
},
veganText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
});
