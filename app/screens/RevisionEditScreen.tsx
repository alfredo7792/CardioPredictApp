// import React, { useState, useEffect } from 'react';
// import { View, TextInput, Button } from 'react-native';
// import { getRevisionById, updateRevision } from '../services/api';
// import { useRoute, useNavigation } from '@react-navigation/native';

// const EditRevisionScreen = () => {
//   const [diagnosis, setDiagnosis] = useState('');
//   const [patientStatus, setPatientStatus] = useState('');
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { id } = route.params;

//   useEffect(() => {
//     fetchRevision();
//   }, []);

//   const fetchRevision = async () => {
//     const data = await getRevisionById(id);
//     setDiagnosis(data.diagnosis);
//     setPatientStatus(data.patient_status);
//   };

//   const handleSubmit = async () => {
//     await updateRevision(id, { diagnosis, patient_status: patientStatus });
//     navigation.goBack();
//   };

//   return (
//     <View>
//       <TextInput placeholder="Diagnosis" value={diagnosis} onChangeText={setDiagnosis} />
//       <TextInput placeholder="Patient Status" value={patientStatus} onChangeText={setPatientStatus} />
//       <Button title="Save" onPress={handleSubmit} />
//     </View>
//   );
// };

// export default EditRevisionScreen;
