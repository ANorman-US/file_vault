const loginForm = document.getElementById('login-form');
const loginButton = document.getElementById('login-form-submit');

loginButton.addEventListener('click', async (e) => {

    e.preventDefault();//prevent refreshing of page

    const username = loginForm.username.value;
    const password = loginForm.password.value;
    //login req
    try{
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username, password})
        });

        if(response.ok) {
            const result = await response.json();
            const token = result.token;
            const userN = result.userN;

            //store token
            localStorage.setItem('jwtToken', token);
            localStorage.setItem('username', userN);
            const redirectUrl = result.redirectUrl;
            window.location.href = redirectUrl;
        }
        else{
            const error = await response.json();
            alert(`Login failed: ${error.message}`);
        }

    }
    catch(err){
        alert('Error logging in');
    }


});