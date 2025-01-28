const registerForm = document.getElementById('register-form');
const registerButton = document.getElementById('register-form-submit');

registerButton.addEventListener('click', async (e) => {

    e.preventDefault();//prevent refreshing of page

    const username = registerForm.username.value;
    const password = registerForm.password.value;
    //register req
    try{
        const response = await fetch('/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username, password})
        });

        if(response.ok) {
            const result = await response.json();
            //const token = result.token;

            //store token
            //localStorage.setItem('jwtToken', token);
            
            const redirectUrl = result.redirectUrl;
            window.location.href = redirectUrl;
        }
        else{
            const error = await response.json();
            alert(`Registration failed: ${error.message}`);
        }

    }
    catch(err){
        alert('Error registering');
    }


});