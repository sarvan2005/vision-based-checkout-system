import requests
import io
from PIL import Image, ImageDraw

def create_dummy_image():
    # Create a simple image to upload
    img = Image.new('RGB', (100, 100), color = 'red')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    return img_byte_arr.getvalue()

def test_api():
    url = "http://localhost:8000/process-image"
    
    # Create dummy file
    files = {
        'files': ('test.jpg', create_dummy_image(), 'image/jpeg')
    }
    
    # Note: NO expected_count parameter
    
    try:
        response = requests.post(url, files=files)
        
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("Response JSON:")
            print(response.json())
            
            data = response.json()
            if "decision" in data:
                print(f"SUCCESS: received decision '{data['decision']}' without expected_count.")
            else:
                print("FAILURE: 'decision' key missing in response.")
        else:
            print("FAILURE: Request failed.")
            print(response.text)
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_api()
