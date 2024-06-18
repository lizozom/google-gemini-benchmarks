## Summary 

![image](https://github.com/lizozom/google-gemini-benchmarks/assets/3016806/6f4023cf-ec44-41a1-8855-f47ad57d52a9)

This project benchmarks the performance of the Gemini 1.5 models (Pro and Flash) when extracting a list of items from an image. The primary objective was to compare the performance of JSON vs. YAML as output formats.

Key Findings
 * **Model Performance**: Gemini Flash outperforms Gemini Pro, as expected.
 * **Format Efficiency**: YAML consistently outperforms JSON across both models.
 * **Scalability**: The performance gap between YAML and JSON widens as the number of items in the list increases.

These results align with expectations, as YAML is inherently more efficient than JSON when it comes to LLM output, with the efficiency difference becoming more pronounced with larger outputs. 

For a detailed explanation, refer to this [article](https://livshitz.medium.com/yaml-vs-json-which-is-more-efficient-for-language-models-5bc11dd0f6df).


## Requirements

 1. **Google Cloud Project**: Create a Google Cloud Platform (GCP) project and enable the [`Vertex AI API`](https://cloud.google.com/vertex-ai/docs/featurestore/).
 2. **Authentication**: Authenticate with your GCP account by running:
```
gcloud init
```
 3. **Environment Setup**: Rename the .env.tpl file to .env and fill in the Google project name and region.

Once you have done that, rename the `.env.tpl` file and fill in the Google project name and region.

## Running the project

To run the project, ensure you have Node.js 18+ installed. Then, execute the following commands:

```
 npm install
 npm run dev
```

