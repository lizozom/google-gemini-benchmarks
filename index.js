import { stringify } from 'csv';
import { createWriteStream } from 'fs';
import dotenv from 'dotenv';

import fs from 'fs';
import { VertexAI } from "@google-cloud/vertexai";
import { tests, models, formats, outputFile, itemCount } from "./config.js";
import { readFileAsBase64, sleep, parseOutput, ensureDirectoryExistence } from "./utils.js";

dotenv.config();

async function runImageTest(modelName, image, prompt, outputFormat, itemCount, retry = false) {
    try {
        const vertexAI = new VertexAI({
            project: process.env.GCP_PROJECT_NAME,
            location: process.env.GCP_REGION
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
            text: `
            ${prompt}. 
            ${countPrompt} 
            Even if there's 1 item, treat it like an array.
            VERY IMPORTANT: Output the result in ${outputFormat} format. 
            `,
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
            itemCount: parsedContent?.length,
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
    const output = createWriteStream(outputFile);
    const stringifier = stringify({ header: true });
    stringifier.pipe(output);

    for (let test of tests) {
        const statsArr = [];
        const { name, fileName, prompt } = test;
        for (let modelName of models) {
            for (let count of itemCount) {
                for (let format of formats) {
                    console.log(`Testing ${name} with ${modelName} model in ${format} mode and ${count} items.`)
                    const stats = await runImageTest(modelName, fileName, prompt, format, count);
                    const statsObj = {
                        format,
                        model: modelName,
                        count,
                        ...test,
                        ...stats,
                    };
                    statsArr.push(statsObj);
                    console.log(`Ran in ${statsObj.executionTime}.`)
                    const { content, ...rest } = statsObj; 

                    const outPath = `./output/${name}/${modelName}/${format}/output_${count}.${format}`;
                    ensureDirectoryExistence(outPath);
                    fs.writeFileSync(
                        outPath, 
                        content);
                    stringifier.write(rest);
                }
            }
        }
    }
    stringifier.end();
}

main() 