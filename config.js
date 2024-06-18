
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const menuPrompt = `Return all menu items in this image, including name, description and price.`
const menuImage = path.join(__dirname, './images/McDonalds-menu.jpg');
const animalPrompt = `Return all animals in this image, including name and description.`
const animalImage = path.join(__dirname, './images/Animal Icons.jpg');

export const models = ['gemini-1.5-pro-001', 'gemini-1.5-flash-001'];
export const formats = ['json', 'yaml'];
export const outputFile = './output/output.csv'
export const itemCount = [1, 5, 10, 20, -1];
export const tests = [
    {
        name: 'animal',
        fileName: animalImage,
        prompt: animalPrompt,
    },
    {
        name: 'menu',
        fileName: menuImage,
        prompt: menuPrompt,
    }
];