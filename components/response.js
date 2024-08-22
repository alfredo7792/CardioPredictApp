import React, { useState, useEffect } from "react";
import { StyleSheet, View, Image, Text } from "react-native";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Markdown from "react-native-markdown-display";

const date = new Date();
const GOOGLE_API_KEY = "AIzaSyBP0UI5VVvQ2MvUUHRZpaSnG9rEA8YM9HE";
const HUGGINGFACE_TOKEN = "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";
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

const API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";
const headers = {"Authorization": `Bearer ${HUGGINGFACE_TOKEN}`};

// Función para generar texto con Google Generative AI
async function generateTextWithGemini(prompt) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

// Función para generar imagen con Hugging Face
async function generateImageWithHuggingFace(prompt) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ inputs: prompt }),
        });
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error("Error generating image:", error);
        return null;
    }
}

export default function Response(props) {
    const [generatedText, setGeneratedText] = useState("");
    const [generatedImage, setGeneratedImage] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const prompt = props.prompt;
            const prompt_img = props.prompt_img;

            // Generar texto con Gemini
            const text = await generateTextWithGemini(prompt);
            setGeneratedText(text);

            // Generar imagen con Hugging Face
            const imageUrl = await generateImageWithHuggingFace(prompt_img);
            setGeneratedImage(imageUrl);
        };
        fetchData();
    }, [props.prompt]);

    return (
        <View style={styles.response}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Image source={require("../assets/icons/robot.png")} style={styles.icon} />
                    <Text style={{ fontWeight: 600 }}>AI Response</Text>
                </View>
                <Text style={{ fontSize: 10, fontWeight: "600" }}>
                    {date.getHours()}:{date.getMinutes()}
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
    icon: {
        width: 28,
        height: 28,
    },
    generatedImage: {
        width: '100%',
        height: 200,
        resizeMode: 'contain',
        marginTop: 16,
    },
});