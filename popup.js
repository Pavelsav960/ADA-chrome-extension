
document.addEventListener('DOMContentLoaded', function() {
  attachButtonListeners();
});

function attachButtonListeners() {
  const checkPageButton = document.getElementById('checkPage');
  if (checkPageButton) {
      checkPageButton.addEventListener('click', function() {
          requestContentScriptExecution();
      });
  }
}

function requestContentScriptExecution() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.scripting.executeScript({
          target: {tabId: tabs[0].id},
          files: ['content.js']
      });
  });
}


chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message) {
      displayResults(message);
  }
});


function displayResults(message) {
  const resultsDiv = document.getElementById('results');
  if (!resultsDiv) return;

  resultsDiv.innerHTML = '';


  displaySummaryInformation(message, resultsDiv);

  if (message.imagesWithoutAltDetails && message.imagesWithoutAltDetails.length > 0) {
      resultsDiv.appendChild(createCollapsibleSection('Images Without Alt Text', message.imagesWithoutAltDetails));
  }

  if (message.inaccessibleElementsDetails && message.inaccessibleElementsDetails.length > 0) {
      resultsDiv.appendChild(createCollapsibleSection('Inaccessible Interactive Elements', message.inaccessibleElementsDetails));
  }

  
}

function createCollapsibleSection(title, items) {
    const section = document.createElement('div');
    section.className = 'section';

    const button = document.createElement('button');
    button.className = 'collapsible';
    button.textContent = title;
    button.addEventListener('click', function() {
        this.classList.toggle('active');
        const content = this.nextElementSibling;
        content.style.display = content.style.display === 'block' ? 'none' : 'block';
    });

    const content = document.createElement('div');
    content.className = 'content';
    content.style.display = 'none';

    const list = document.createElement('ul');
    items.forEach(item => {
        const listItem = document.createElement('li');
        listItem.className = 'detail-item'; // Use a more general class name since it's not always an image

        // Check if the item is a string or has a .src property for image sources
        if (typeof item === 'string') {
            listItem.textContent = item; // Directly use the string for non-image items
        } else if (item.src) {
            listItem.setAttribute('data-src', item.src);
            listItem.textContent = item.src;
            listItem.addEventListener('click', function() {
                highlightImageOnPage(item.src);
            });
        }
        list.appendChild(listItem);
    });

    content.appendChild(list);
    section.appendChild(button);
    section.appendChild(content);

    return section;
}

function highlightImageOnPage(src) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "highlightImage", src: src});
  });
}


function displaySummaryInformation(message, container) {
  const summaryInfo = document.createElement('div');
  summaryInfo.className = 'summary';

  const totalImages = document.createElement('p');
  totalImages.textContent = `Total images: ${message.totalImages}`;
  summaryInfo.appendChild(totalImages);

  const imagesWithoutAlt = document.createElement('p');
  imagesWithoutAlt.textContent = `Images without alt text: ${message.totalImagesWithoutAlt}`;
  summaryInfo.appendChild(imagesWithoutAlt);

  const improperlyNestedHeadings = document.createElement('p');
  improperlyNestedHeadings.textContent = `Improperly nested headings: ${message.improperlyNestedHeadings ? 'Yes' : 'No'}`;
  summaryInfo.appendChild(improperlyNestedHeadings);

  const inaccessibleElementsCount = document.createElement('p');
  inaccessibleElementsCount.textContent = `Interactive elements not keyboard accessible: ${message.inaccessibleElementsCount}`;
  summaryInfo.appendChild(inaccessibleElementsCount);

  // Include lang attribute check results
  const langAttribute = document.createElement('p');
  if (message.langCheck.validLang) {
      langAttribute.textContent = `Page language set to: ${message.langCheck.lang}`;
  } else {
      langAttribute.textContent = "No 'lang' attribute set or incorrect.";
  }
  summaryInfo.appendChild(langAttribute);

  container.appendChild(summaryInfo);
}

function adjustTextSize(textSize) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.scripting.executeScript({
          target: {tabId: tabs[0].id},
          func: textSizeAdjustmentFunction,
          args: [textSize],
      });
  });
}

function textSizeAdjustmentFunction(newSize) {
  document.documentElement.style.fontSize = newSize + 'em';
}

document.addEventListener('DOMContentLoaded', function() {
  attachButtonListeners();
  
  const textSizeSlider = document.getElementById('textSizeSlider');
  if (textSizeSlider) {
      textSizeSlider.addEventListener('input', function() {
          adjustTextSize(this.value);
      });
  }
});

function displayLangInfo(langData) {
  const langInfoDiv = document.createElement('div');
  langInfoDiv.textContent = langData.validLang ? `Language set to: ${langData.lang}` : "No 'lang' attribute set.";
  // Adjust styling as needed
  document.getElementById('results').appendChild(langInfoDiv);
}


document.getElementById('enhanceLinks').addEventListener('click', function() {
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    chrome.scripting.executeScript({
      target: {tabId: tabs[0].id},
      function: enhanceLinksAccessibility,
    });
  });
});

function enhanceLinksAccessibility() {
  const links = document.querySelectorAll('a');
  links.forEach(link => {
    if (!link.textContent.trim() && link.querySelectorAll('img').length === 0) {
      // If the link has no text and contains no images, consider adding an aria-label or text content
      link.style.outline = '2px solid red'; // Highlight links that might need an aria-label or improvement
    } else {
      // Ensure all links are easily visible
      link.style.textDecoration = 'underline';
      link.style.textDecorationThickness = '5px'; // Adjust the thickness as needed
      link.style.textUnderlineOffset = '5px';
    }
  });
}

