import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { VertexAI } from "@google-cloud/vertexai";
import { readFileAsBase64, sleep, parseOutput } from "./utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const menuPrompt = `Return all menu items in this image, including name, description and price.`
const menuImage = path.join(__dirname, './images/McDonalds-menu.jpg');
const animalPrompt = `Return all animals in this image, including name and description.`
const animalImage = path.join(__dirname, './images/Animal Icons.jpg');

const models = ['gemini-1.5-pro-001', 'gemini-1.5-flash-001'];
const formats = ['json', 'yaml'];

const tests = [
    {
        name: 'menu',
        fileName: menuImage,
        prompt: menuPrompt,
        outputFile: './output/menuStats.json'
    },
    {
        name: 'animal',
        fileName: animalImage,
        prompt: animalPrompt,
        outputFile: './output/animalStats.json'
    }
];

async function runImageTest(modelName, image, prompt, outputFormat, itemCount, retry = false) {
    try {
        const vertexAI = new VertexAI({
            project: 'silken-dogfish-426508-u8',
            location: 'us-central1'
        });

        const model = vertexAI.getGenerativeModel({
            model: modelName,
        });

        const data = readFileAsBase64(image);

        const imagePart = {
            inlineData: {
                data,
                'mimeType': 'image/jpeg'
            }
        }

        const countPrompt = itemCount === -1 ? '' : `Get only ${itemCount} items.`
        const promptPart = {
            text: `${prompt}. ${countPrompt} Output the result in ${outputFormat} format. Always wrap strings in double quotes.`,
        }

        const startTime = performance.now();
        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [
                    promptPart,
                    imagePart
                ],
            }]
        });

        const content = result.response.candidates[0].content.parts[0].text;
        const parsedContent = parseOutput(content, outputFormat);

        const resultStats = {
            content,
            reqItemCount: itemCount,
            itemCount: parsedContent.length,
            contentLength: content.length,
            executionTime: performance.now() - startTime
        }
        return resultStats;
    } catch (error) {
        const isQuotaError = error.message.indexOf('429') > -1;
        if (isQuotaError) {
            if (retry) {
                throw error;
            }
            await sleep(60);
            return runImageTest(modelName, image, prompt, outputFormat, itemCount, true);
        } else {
            throw error;
        }
    }
}

async function main() {
    const itemCount = [1, 5, 10, 20, -1];
    const statsArr = [];
    for (let test of tests) {
        const { name, fileName, prompt, outputFile } = test;
        for (let modelName of models) {
            for (let count of itemCount) {
                for (let format of formats) {
                    console.log(`Testing ${name} with ${modelName} model in ${format} mode and ${count} items.`)
                    const stats = await runImageTest(modelName, fileName, prompt, format, count);
                    const statsObj = {
                        name,
                        test,
                        format,
                        model: modelName,
                        count,
                        stats,
                    };
                    statsArr.push(statsObj);
                    console.log(`Ran in ${statsObj.stats.executionTime}.`)
                    fs.writeFileSync(outputFile, JSON.stringify(statsArr, null, 2));
                }
            }
        }
    }
}

main() 