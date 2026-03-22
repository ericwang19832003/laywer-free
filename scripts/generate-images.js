#!/usr/bin/env node

/**
 * AI Image Generation Script for Lawyer Free
 * 
 * Generates hero images and illustrations using DALL-E 3
 * 
 * Usage:
 *   OPENAI_API_KEY=sk-... node scripts/generate-images.js
 * 
 * Requires:
 *   - OpenAI API key with DALL-E 3 access
 *   - Node.js 18+
 */

import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = path.join(__dirname, '../public/images/ai-generated')

const IMAGE_PROMPTS = [
  {
    name: 'hero-welcome',
    prompt: `Professional legal illustration for a self-help legal platform. A friendly person reviewing documents at a clean desk, with a laptop, scales of justice, and legal folders visible. Soft pastel colors - blues, greens, and warm neutrals. Flat vector style with subtle gradients. No text. Clean modern aesthetic. High quality, 1024x1024.`
  },
  {
    name: 'hero-dashboard',
    prompt: `Modern dashboard illustration for a legal case management app. A person organizing legal documents and deadlines on a digital interface. Shows calendar, folders, checklist items. Warm friendly style with pastel colors. Professional yet approachable. Flat design. No text. High quality, 1024x1024.`
  },
  {
    name: 'hero-filing',
    prompt: `Legal filing illustration - a person confidently filing court documents. Shows a gavel, courthouse silhouette in background, and organized papers. Encouraging and empowering tone. Pastel color palette with teal and amber accents. Professional vector style. No text. High quality, 1024x1024.`
  },
  {
    name: 'hero-success',
    prompt: `Celebration illustration for legal success - person with arms raised in victory near a large checkmark. Confetti and sparkles. Scales of justice in background. Shows achievement and progress. Warm celebratory colors - gold, green, soft blues. Friendly flat vector style. No text. High quality, 1024x1024.`
  },
  {
    name: 'hero-evidence',
    prompt: `Legal evidence organization illustration - person sorting through documents and files efficiently. Shows folders, tags, a magnifying glass for searching. Clean organized workspace. Pastel blue and green colors. Professional flat design. No text. High quality, 1024x1024.`
  },
  {
    name: 'empty-cases',
    prompt: `Friendly empty state illustration for a legal app with no cases yet. A person looking at an empty folder with a curious expression. Warm encouraging colors - soft orange, cream, light blue. Minimal flat design. Professional yet friendly. No text. High quality, 1024x1024.`
  },
  {
    name: 'empty-evidence',
    prompt: `Empty evidence vault illustration - organized file cabinets and folders with one person placing a document inside. Bright welcoming colors - teal, cream, soft coral. Clean minimal style. Encourages action. No text. High quality, 1024x1024.`
  },
  {
    name: 'empty-deadlines',
    prompt: `Peaceful empty deadlines illustration - a calendar with no entries, showing a relaxed person with a coffee cup. Soft relaxing colors - mint green, lavender, cream. Calming professional style. No stress visual. No text. High quality, 1024x1024.`
  },
  {
    name: 'welcome-hero',
    prompt: `Welcome illustration for new legal app users - person being guided through legal documents by helpful icons. Shows a path of documents leading to success. Bright hopeful colors - sunshine yellow, sky blue, soft green. Inspiring flat design. No text. High quality, 1024x1024.`
  },
  {
    name: 'contract-hero',
    prompt: `Contract dispute illustration - two hands shaking over a document with a handshake. Shows trust and agreement. Professional blue and green color scheme with gold accents. Clean vector style. Partnership and resolution themes. No text. High quality, 1024x1024.`
  },
  {
    name: 'family-hero',
    prompt: `Family law illustration - house with heart, family figures, and legal scales combined subtly. Warm loving colors - soft pink, coral, cream. Sensitive and professional approach. Represents protection and family. No text. High quality, 1024x1024.`
  },
  {
    name: 'pi-hero',
    prompt: `Personal injury illustration - person reviewing medical documents with a caring medical professional icon. Shows documentation and evidence gathering. Professional healthcare-legal theme. Calming teal and white colors. No text. High quality, 1024x1024.`
  },
]

async function generateImages() {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    console.error('❌ Error: OPENAI_API_KEY environment variable is required')
    console.log('\nTo set your API key:')
    console.log('  OPENAI_API_KEY=sk-... node scripts/generate-images.js\n')
    process.exit(1)
  }

  const client = new OpenAI({ apiKey })

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
    console.log(`📁 Created output directory: ${OUTPUT_DIR}`)
  }

  console.log('\n🎨 Lawyer Free AI Image Generator\n')
  console.log(`📂 Output directory: ${OUTPUT_DIR}\n`)

  for (const { name, prompt } of IMAGE_PROMPTS) {
    const outputPath = path.join(OUTPUT_DIR, `${name}.png`)
    
    if (fs.existsSync(outputPath)) {
      console.log(`⏭️  Skipping ${name}.png (already exists)`)
      continue
    }

    console.log(`🎯 Generating: ${name}.png`)
    console.log(`   Prompt: ${prompt.substring(0, 80)}...`)

    try {
      const response = await client.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'b64_json',
      })

      const base64Data = response.data[0].b64_json
      
      if (base64Data) {
        fs.writeFileSync(outputPath, Buffer.from(base64Data, 'base64'))
        console.log(`✅ Saved: ${outputPath}\n`)
      } else {
        console.log(`⚠️  No image data returned for ${name}\n`)
      }
    } catch (error) {
      console.error(`❌ Error generating ${name}.png:`, error.message, '\n')
    }

    // Rate limiting - wait between requests
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  console.log('\n✨ Image generation complete!')
  console.log(`📁 Images saved to: ${OUTPUT_DIR}\n`)
}

generateImages().catch(console.error)
