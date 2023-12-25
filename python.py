import requests
from bs4 import BeautifulSoup

url = 'https://www.sinema.cc/film/silent-night/'  # İlgili web sayfasının adresini girin

response = requests.get(url)
soup = BeautifulSoup(response.text, 'html.parser')

# İframe etiketini bulun
iframe = soup.find('iframe')

if iframe:
    # İframe'in kaynak bağlantısını alın
    iframe_src = iframe.get('src')

    # İframe içeriğini almak için ikinci bir request yapın
    iframe_response = requests.get(iframe_src)
    
    # İframe içeriğini ekrana yazdırın
    print(iframe_response.text)
else:
    print("Iframe bulunamadı.")
