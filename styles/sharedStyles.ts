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
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
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
});
