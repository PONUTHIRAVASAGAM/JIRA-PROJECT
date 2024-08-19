<template>
<nav class="navbar">
    <ul>
        <li>
            <router-link to="/">Home</router-link>
        </li>
        <li>
            <router-link to="/profile">Profile</router-link>
        </li>
        <li><button @click="logout">Logout</button></li>
    </ul>
</nav>
</template>

<script>
export default {
    methods: {
        logout() {
            localStorage.removeItem('userDetails');
            this.$router.push('/');
        }
    }
};
</script>

<style scoped>
.navbar {
    background-color: #333;
    padding: 1rem;
}

.navbar ul {
    list-style-type: none;
    display: flex;
    gap: 10px;
}

.navbar ul li {
    display: inline;
}

.navbar ul li a,
.navbar ul li button {
    color: white;
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
}
</style>
