document.addEventListener('DOMContentLoaded', function () { 
	const inputField = 
		document.getElementById('userImg'); 
	const removeBackgroundButton = 
		document.getElementById('removeBackground'); 
	const imagePreview = 
		document.getElementById('imagePreview'); 
	const bgRemove = 
		document.getElementById('bgRemove'); 
	const downloadButton = 
		document.getElementById('downloadButton'); 

	inputField.addEventListener('change', function () { 
		const file = this.files[0]; 
		const reader = new FileReader(); 

		reader.onload = function (e) { 
			const img = document.createElement('img'); 
			img.src = e.target.result; 
			imagePreview.innerHTML = ''; 
			imagePreview.appendChild(img); 
		} 

		reader.readAsDataURL(file); 
	}); 

	removeBackgroundButton.addEventListener('click', 
		async function () { 
		const file = inputField.files[0]; 
		const formData = new FormData(); 
		formData.append('image_file', file); 

		try { 
			const response = 
			await fetch('https://api.remove.bg/v1.0/removebg', { 
				method: 'POST', 
				headers: { 
					'X-Api-Key': '39nH2XMTcoAxnogxmqVBuAXH', 
				}, 
				body: formData, 
			}); 

			const result = await response.blob(); 
			const imgUrl = URL.createObjectURL(result); 
			bgRemove.innerHTML = 
				`<img src="${imgUrl}" alt="Removed Background">`; 
			downloadButton.href = imgUrl; 
			downloadButton.download = 
				'background_removed_image.png'; 
			downloadButton.style.display = 
				'inline-block'; 
		} catch (error) { 
			console.error('Error removing background:', error); 
		} 
	}); 
});