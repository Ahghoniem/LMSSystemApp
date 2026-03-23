import axios from "axios";

const arabicToEnglish = {
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
  '.':"0"
};

function convertArabicToEnglish(arabicNumber) {
  return arabicNumber.split('').map(char => arabicToEnglish[char] || char).join('');
}
function extract14DigitNumber(text) {
  const match = text.match(/[\d٠-٩]+(\.[\d٠-٩]+)?/);
  if (match) {
    const arabicNumber = match[0];  
    const englishNumber = convertArabicToEnglish(arabicNumber);  
    return englishNumber;
  } else {
    return null; 
  }
}

async function sendOcrRequest(base64Image) {
  const url = 'https://api.ocr.space/parse/image';
  const headers = {
    apikey: 'K81369309088957',
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const formData = new URLSearchParams({
    language: 'auto',
    isOverlayRequired: 'false',
    base64Image: `data:image/jpeg;base64,${base64Image}`,
    OCREngine: '2',
    issearchablepdfhidetextlayer: 'false',
    filetype: 'jpg',
  });

  try {
    const response = await axios.post(url, formData.toString(), { headers });
    const result= extract14DigitNumber(response.data.ParsedResults[0].ParsedText);
    if(result) return result
    return response
  } catch (error) {
   return ('Error:', error.response?.data || error.message);
  }
}
export default sendOcrRequest