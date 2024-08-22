import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from './AuthContext'; // Asegúrate de que la ruta sea correcta
import { EXPO_API_URL } from './enviroment';


interface Profile {
  id: number;
  first_name: string;
  last_name: string;
  DNI: string;
  age: number;
  sex: string;
  username: string;
  email: string;
  password: string; // Aunque no lo muestres, está aquí por si acaso
  role_id: number;
  date_created: string;
}

interface Role {
  id: number;
  name: string;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const profileResponse = await fetch(`${EXPO_API_URL}/users/${user.user_id}`);
          if (!profileResponse.ok) {
            throw new Error('Failed to fetch profile');
          }
          const profileData: Profile = await profileResponse.json();
          setProfile(profileData);

          const roleResponse = await fetch(`${EXPO_API_URL}/roles`);
          if (!roleResponse.ok) {
            throw new Error('Failed to fetch roles');
          }
          const roles: Role[] = await roleResponse.json();
          const userRole = roles.find(r => r.id === profileData.role_id) || { id: profileData.role_id, name: 'Unknown' };
          setRole(userRole);
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError('Error fetching user data');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00BFFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          style={styles.avatar}
          source={{ uri: 'https://www.w3schools.com/w3images/avatar2.png' }} // Reemplaza con una URL real si es necesario
        />
        <Text style={styles.title}>Perfil del usuario</Text>
      </View>
      {profile ? (
        <View style={styles.profileContainer}>
          <View style={styles.infoRow}>
            <Icon name="person-outline" size={24} color="#007BFF" style={styles.icon} />
            <Text style={styles.text}>Nombre de usuario: <Text style={styles.highlight}>{profile.username}</Text></Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="person" size={24} color="#007BFF" style={styles.icon} />
            <Text style={styles.text}>Nombre: <Text style={styles.highlight}>{profile.first_name} {profile.last_name}</Text></Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="id-card-outline" size={24} color="#007BFF" style={styles.icon} />
            <Text style={styles.text}>DNI: <Text style={styles.highlight}>{profile.DNI}</Text></Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="calendar-outline" size={24} color="#007BFF" style={styles.icon} />
            <Text style={styles.text}>Edad: <Text style={styles.highlight}>{profile.age}</Text></Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="accessibility-outline" size={24} color="#007BFF" style={styles.icon} />
            <Text style={styles.text}>Sexo: <Text style={styles.highlight}>{profile.sex}</Text></Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="mail-outline" size={24} color="#007BFF" style={styles.icon} />
            <Text style={styles.text}>Correo electrónico: <Text style={styles.highlight}>{profile.email}</Text></Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="briefcase-outline" size={24} color="#007BFF" style={styles.icon} />
            <Text style={styles.text}>Rol: <Text style={styles.highlight}>{role ? role.name : 'Loading role...'}</Text></Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="calendar" size={24} color="#007BFF" style={styles.icon} />
            <Text style={styles.text}>Fecha de registro: <Text style={styles.highlight}>{new Date(profile.date_created).toLocaleDateString()}</Text></Text>
          </View>
        </View>
      ) : (
        <Text style={styles.text}>No profile data available</Text>
      )}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#007BFF',
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  profileContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginLeft: 10,
  },
  highlight: {
    fontWeight: 'bold',
    color: '#007BFF',
  },
  loadingText: {
    fontSize: 18,
    color: '#00BFFF',
    marginTop: 10,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    marginTop: 10,
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#FF3B30',
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: {
    width: 24,
    height: 24,
    color: '#007BFF',
  },
});
