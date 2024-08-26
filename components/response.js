import React, { useState, useEffect } from "react";
import { StyleSheet, View, Image, Text } from "react-native";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Markdown from "react-native-markdown-display";

const GOOGLE_API_KEY = "AIzaSyBP0UI5VVvQ2MvUUHRZpaSnG9rEA8YM9HE";
const HUGGINGFACE_TOKEN = "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";
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

const API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";
const headers = { "Authorization": `Bearer ${HUGGINGFACE_TOKEN}` };
var ultimoMensaje = "";
// Función para generar texto con Google Generative AI
async function generateTextWithGemini(prompt) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        return result.response.text(); 
    } catch (error) {
        console.error("Error generating text:", error);
        return "";
    }
}

// Función para convertir un blob a Base64
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

async function generateImageWithHuggingFace(prompt) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ inputs: prompt }),
        });

        // Convertir la respuesta a blob
        const blob = await response.blob();
        
        // Convertir el blob a una cadena Base64
        const base64Data = await blobToBase64(blob);

        return base64Data; // Esta es la cadena Base64 que se usará en la imagen
    } catch (error) {
        console.error("Error generating image:", error);
        return null;
    }
}


export function obtenerUM() {
    return ultimoMensaje;
}

export  function Response({ prompt, prompt_img }) {
    const [generatedText, setGeneratedText] = useState("");
    const [generatedImage, setGeneratedImage] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            // Generar texto con Gemini
            const text = await generateTextWithGemini(prompt);
            setGeneratedText(text);
            if(prompt_img!=""){
            // Generar imagen con Hugging Face
            const imageUrl = await generateImageWithHuggingFace(prompt_img);
            setGeneratedImage(imageUrl);
            }

        };
        fetchData();
    }, [prompt, prompt_img]);

    const date = new Date();

    ultimoMensaje = generatedText;
    return (
        <View style={styles.response}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Image source={require("../assets/icons/robot.png")} style={styles.icon} />
                    <Text style={styles.headerText}>AI Response</Text>
                </View>
                <Text style={styles.timeText}>
                    {`${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`}
                </Text>
            </View>
            <Markdown>{generatedText}</Markdown>
            {generatedImage && (
                <Image source={{ uri: generatedImage }} style={styles.generatedImage} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    response: {
        flexDirection: "column",
        gap: 8,
        backgroundColor: "#fafafa",
        marginBottom: 8,
        padding: 16,
        borderRadius: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    icon: {
        width: 28,
        height: 28,
    },
    headerText: {
        fontWeight: "600",
    },
    timeText: {
        fontSize: 10,
        fontWeight: "600",
    },
    generatedImage: {
        width: '100%',
        height: 200,
        resizeMode: 'contain',
        marginTop: 16,
    },
});
