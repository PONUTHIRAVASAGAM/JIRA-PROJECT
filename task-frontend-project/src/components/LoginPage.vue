<template>
<div class="login-container">
    <form @submit.prevent="submit(email,password)" class="login-form">
        <h2 class="login-title">Login</h2>

        <div class="form-group">
            <label for="email">Email:</label>
            <input v-model="email" type="email" id="email" placeholder="Enter your email" required />
        </div>

        <div class="form-group">
            <label for="password">Password:</label>
            <input v-model="password" type="password" id="password" placeholder="Enter your password" required />
        </div>

        <button type="submit" class="login-button">Login</button>
    </form>
</div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
    data() {
        return {
            email: '',
            password: '',
            restServerLocation: 'http://localhost:3000',
        };
    },
    mounted() {
        this.redirection();
    },
    methods: {

        redirection() {
            if (localStorage.getItem('userDetails')) {
                console.log("mounted Calling");
                this.$router.back()
                // this.$router.go(-1);
            }
        },

        submit: function (email, password) {
            this.loading = true;
            let data = {
                email: email,
                password: password,
            };

            var ax = axios.create({
                baseURL: this.restServerLocation,
            });
            return new Promise((resolve, reject) => {
                ax
                    .post("api/users/authenticate", data)
                    .then((response) => {
                        this.$router.push({
                            name: 'user',
                            params: {
                                userId: response.data.user.id
                            }
                        });
                        this.user = response.data.user;
                        console.log("user=====", response.data.user);
                        localStorage.setItem("userDetails", JSON.stringify(this.user));
                        // localStorage.setItem("userDetails", response.data.user);
                        // console.log("user=====",this.user);

                        resolve(response);
                    })
                    .catch((err) => {
                        Swal.fire({
                            title: 'Error!',
                            text: 'Wrong username and password',
                            icon: 'error',
                            confirmButtonText: 'Try Again'
                        });
                        reject(err);
                    });
            });
        },

    }
};
</script>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 75vh;
    background-color: #f0f2f5;
}

.login-form {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    max-width: 400px;
    width: 100%;
}

.login-title {
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
    color: #333;
    text-align: center;
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
    color: #555;
}

.form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
}

.login-button {
    width: 100%;
    padding: 0.75rem;
    border: none;
    border-radius: 4px;
    background-color: #007bff;
    color: white;
    font-size: 1rem;
    cursor: pointer;
}

.login-button:hover {
    background-color: #0056b3;
}

.login-button:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(38, 143, 255, 0.5);
}
</style>
