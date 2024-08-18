// src/components/Sidebar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

interface SidebarProps {
  isVisible: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isVisible, onClose, onNavigate }) => {
  if (!isVisible) return null;

  return (
    <View style={styles.sidebarContainer}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>X</Text>
      </TouchableOpacity>
      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => onNavigate('Home')}>
          <Text style={styles.menuItemText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => onNavigate('EditUser')}>
          <Text style={styles.menuItemText}>Edit User</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => onNavigate('FormNewUser')}>
          <Text style={styles.menuItemText}>New User</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 250,
    height: '100%',
    backgroundColor: '#333',
    padding: 20,
    zIndex: 1000,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
  },
  menu: {
    marginTop: 50,
  },
  menuItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  menuItemText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default Sidebar;
