import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAuth } from './AuthContext'; // Asegúrate de que la ruta sea correcta

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
          const profileResponse = await fetch(`http://127.0.0.1:8080/users/${user.user_id}`);
          if (!profileResponse.ok) {
            throw new Error('Failed to fetch profile');
          }
          const profileData: Profile = await profileResponse.json();
          setProfile(profileData);

          const roleResponse = await fetch('http://127.0.0.1:8080/roles');
          if (!roleResponse.ok) {
            throw new Error('Failed to fetch roles');
          }
          const roles: Role[] = await roleResponse.json();
          const userRole = roles.find(r => r.id === profileData.role_id) || { id: profileData.role_id, name: 'Unknown' };
          setRole(userRole);
        } catch (err) {
          console.error('Error fetching user data:', err);
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
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
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
      <Text style={styles.title}>Perfil del usuario</Text>
      {profile ? (
        <View style={styles.profileContainer}>
          <Text style={styles.text}>Nombre de usuario: {profile.username}</Text>
          <Text style={styles.text}>Nombre: {profile.first_name} {profile.last_name}</Text>
          <Text style={styles.text}>DNI: {profile.DNI}</Text>
          <Text style={styles.text}>Edad: {profile.age}</Text>
          <Text style={styles.text}>Sexo: {profile.sex}</Text>
          <Text style={styles.text}>Correo electrónico: {profile.email}</Text>
          <Text style={styles.text}>Rol: {role ? role.name : 'Loading role...'}</Text>
          <Text style={styles.text}>Fecha de registro: {new Date(profile.date_created).toLocaleDateString()}</Text>
        </View>
      ) : (
        <Text>No profile data available</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  profileContainer: {
    width: '100%',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    fontSize: 18,
    marginVertical: 4,
  },
  errorText: {
    color: 'red',
    fontSize: 18,
  },
  logoutButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#FF0000',
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
