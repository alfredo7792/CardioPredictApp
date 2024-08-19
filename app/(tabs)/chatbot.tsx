import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, Modal, Button } from 'react-native';
import { StatusBar } from "expo-status-bar";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Response from "@/components/response";
import Message from "@/components/message";

const STORAGE_KEY = '@chat_history';
const COUNTER_KEY = '@chat_counter';

interface Chat {
  id: number;
  name: string;
  messages: string[];
}

const Chatbot = () => {
  const [inputText, setInputText] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [chatCounter, setChatCounter] = useState<number>(1);
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
  const [chatToDelete, setChatToDelete] = useState<number | null>(null);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      const storedCounter = await AsyncStorage.getItem(COUNTER_KEY);
      if (storedData !== null) {
        const loadedChats = JSON.parse(storedData);
        setChats(loadedChats);
        if (loadedChats.length > 0) {
          setCurrentChatId(loadedChats[0].id);
        }
      }
      if (storedCounter !== null) {
        setChatCounter(parseInt(storedCounter, 10));
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const saveChats = async (newChats: Chat[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newChats));
    } catch (error) {
      console.error('Error saving chats:', error);
    }
  };

  const saveChatCounter = async (newCounter: number) => {
    try {
      await AsyncStorage.setItem(COUNTER_KEY, newCounter.toString());
    } catch (error) {
      console.error('Error saving chat counter:', error);
    }
  };

  const handleSearchInput = () => {
    if (inputText.trim() && currentChatId !== null) {
      const updatedChats = chats.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages: [...chat.messages, inputText] }
          : chat
      );
      setChats(updatedChats);
      saveChats(updatedChats);
      setInputText("");
    }
  };

  const createNewChat = () => {
    const newChat: Chat = {
      id: chatCounter,
      name: `Chat ${chatCounter}`,
      messages: []
    };
    const updatedChats = [newChat, ...chats];
    setChats(updatedChats);
    setCurrentChatId(newChat.id);
    setChatCounter(chatCounter + 1);
    saveChats(updatedChats);
    saveChatCounter(chatCounter + 1);
  };

  const showDeleteConfirmation = (chatId: number) => {
    setChatToDelete(chatId);
    setShowConfirmDelete(true);
  };

  const deleteChat = () => {
    if (chatToDelete !== null) {
      const updatedChats = chats.filter(chat => chat.id !== chatToDelete);
      setChats(updatedChats);
      if (currentChatId === chatToDelete) {
        setCurrentChatId(updatedChats.length > 0 ? updatedChats[0].id : null);
      }
      saveChats(updatedChats);
      setShowConfirmDelete(false);
      setChatToDelete(null);
    }
  };

  const currentChat = chats.find(chat => chat.id === currentChatId);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {/* Header */}
      <View style={styles.header}>
        <Image source={require("../../assets/icons/robot.png")} style={styles.icon} />
        <Text style={styles.headerText}>Gemini AI</Text>
        <TouchableOpacity onPress={createNewChat} style={styles.newChatButton}>
          <Text style={styles.newChatButtonText}>New Chat</Text>
        </TouchableOpacity>
      </View>

      {/* Chat List */}
      <FlatList
        horizontal
        data={chats}
        renderItem={({ item }) => (
          <View style={styles.chatItemContainer}>
            <TouchableOpacity 
              style={[styles.chatItem, currentChatId === item.id && styles.selectedChatItem]}
              onPress={() => setCurrentChatId(item.id)}
            >
              <Text style={styles.chatItemText}>{item.name}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => showDeleteConfirmation(item.id)} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>X</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={item => item.id.toString()}
        style={styles.chatList}
      />

      {/* Content */}
      <FlatList
        style={styles.flatList}
        data={currentChat?.messages || []}
        renderItem={({ item }) => (
          <View>
            <Message message={item} />
            <Response prompt={item} />
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />

      {/* Search-Bar */}
      <View style={styles.searchBar}>
        <TextInput 
          placeholder="Ask to Gemini AI" 
          style={styles.input} 
          value={inputText} 
          onChangeText={setInputText} 
          selectionColor={"#323232"}
        />
        <TouchableOpacity onPress={handleSearchInput}>
          <Image source={require("../../assets/icons/right-arrow.png")} style={styles.icon} />
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmDelete}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowConfirmDelete(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Are you sure you want to delete this chat?</Text>
            <Button title="Cancel" onPress={() => setShowConfirmDelete(false)} />
            <Button title="Delete" onPress={deleteChat} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 36,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    margin: 8,
  },
  icon: {
    width: 32,
    height: 32,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#323232",
  },
  newChatButton: {
    backgroundColor: "#007AFF",
    padding: 8,
    borderRadius: 8,
  },
  newChatButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  chatList: {
    maxHeight: 50,
  },
  chatItemContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  chatItem: {
    padding: 8,
    marginRight: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
  },
  selectedChatItem: {
    backgroundColor: "#B0B0B0",
  },
  chatItemText: {
    fontWeight: "600",
  },
  deleteButton: {
    padding: 8,
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    marginLeft: 8,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  flatList: {
    paddingHorizontal: 16,
    marginBottom: 80,
  },
  searchBar: {
    backgroundColor: "#ffffff",
    width: "100%",
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 16,
    gap: 8,
  },
  input: {
    backgroundColor: "#fff",
    width: "85%",
    fontSize: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 32,
    borderWidth: 0.1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default Chatbot;
