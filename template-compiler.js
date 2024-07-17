import { readFileSync } from 'fs';
import { resolve } from 'path';

function replaceProps(content, props) {
  return content.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, prop) => props[prop] || '');
}

function replaceSlots(content, slots) {
  return content.replace(/<slot\s+name=["'](\w+)["']\s*\/>/g, (match, slotName) => slots[slotName] || '');
}

function mergeClasses(existingClasses, newClasses) {
  const classSet = new Set([...existingClasses.split(/\s+/), ...newClasses.split(/\s+/)]);
  return Array.from(classSet).filter(Boolean).join(' ');
}

export default function templateCompiler() {
  return {
    name: 'template-compiler',
    transformIndexHtml(html) {
      const componentCache = new Map();

      function processComponent(match, name, offset, fullHtml) {

        const propsMatch = match.match(/props=['](.+?)[']/);
        const classMatch = match.match(/class=["'](.+?)["']/);
        const slotEndRegex = new RegExp(`>([^]*?)<\/em-${name}>`);
        const slotContent = match.match(slotEndRegex);

        const src = 'components/' + name + '.html';
        const props = propsMatch ? propsMatch[1] : '{}';
        const cssClass = classMatch ? classMatch[1] : '';
        const slots = slotContent ? slotContent[1] : '';
        
        const filePath = resolve(process.cwd(), src);
        
        if (!componentCache.has(filePath)) {
          componentCache.set(filePath, readFileSync(filePath, 'utf-8'));
        }
        
        let content = componentCache.get(filePath);
        
        // Parse props
        const propsObj = JSON.parse(props.replace(/'/g, '"'));
        
        // Replace props
        content = replaceProps(content, propsObj);
        
        // Parse slots
        const slotsObj = {};
        const slotRegex = /<slot\s+name=["'](\w+)["']>([\s\S]*?)<\/slot>/g;
        let slotMatch;
        while ((slotMatch = slotRegex.exec(slots)) !== null) {
          slotsObj[slotMatch[1]] = slotMatch[2].trim();
        }
        
        // Replace slots
        content = replaceSlots(content, slotsObj);
        
        // Merge classes
        if (cssClass) {
          const classRegex = /class="([^"]+)"/;
          if (classRegex.test(content)) {
            content = content.replace(classRegex, (match, classes) => {
              const mergedClasses = mergeClasses(classes, cssClass);
              return `class="${mergedClasses}"`;
            });
          } else {
            content = content.replace(/>/, match => {
              return ` class="${cssClass}"${match}`;
            });
          }
        }

        // Preserve indentation
        const lines = fullHtml.substr(0, offset).split('\n');
        const lastLine = lines[lines.length - 1];
        const indentation = lastLine.match(/^\s*/)[0];
        
        // Apply indentation to each line of the content
        content = content.split('\n').map((line, index) => {
          return index === 0 ? line : indentation + line;
        }).join('\n');

        return content;
      }

      // Process all components recursively
      let processedHtml = html;
      const componentRegex = /<em-([a-zA-Z0-9\-]+)\s+(?:[^>]+?\s+)*?(?:src|props|class)=["'][^>]*?>(?:[^]*?<\/em-\1>)?/g;

      while (componentRegex.test(processedHtml)) {
        processedHtml = processedHtml.replace(componentRegex, processComponent);
      }

      return processedHtml;
    }
  }
}