<template>
    <div class="home-container">
        <!-- Header -->
        <header class="header">
            <div class="logo">iBoxt</div>
            <button @click="goToProfile" class="profile-button">
                <span class="profile-icon">
                    <svg width="40" height="40" viewBox="-6 -6 32.00 32.00" version="1.1"
                        xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000">
                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                        <g id="SVGRepo_iconCarrier">
                            <title>profile_round [#1342]</title>
                            <desc>Created with Sketch.</desc>
                            <defs> </defs>
                            <g id="Page-1" stroke-width="0.0002" fill="none" fill-rule="evenodd">
                                <g id="Dribbble-Light-Preview" transform="translate(-140.000000, -2159.000000)"
                                    fill="#000000">
                                    <g id="icons" transform="translate(56.000000, 160.000000)">
                                        <path
                                            d="M100.562548,2016.99998 L87.4381713,2016.99998 C86.7317804,2016.99998 86.2101535,2016.30298 86.4765813,2015.66198 C87.7127655,2012.69798 90.6169306,2010.99998 93.9998492,2010.99998 C97.3837885,2010.99998 100.287954,2012.69798 101.524138,2015.66198 C101.790566,2016.30298 101.268939,2016.99998 100.562548,2016.99998 M89.9166645,2004.99998 C89.9166645,2002.79398 91.7489936,2000.99998 93.9998492,2000.99998 C96.2517256,2000.99998 98.0830339,2002.79398 98.0830339,2004.99998 C98.0830339,2007.20598 96.2517256,2008.99998 93.9998492,2008.99998 C91.7489936,2008.99998 89.9166645,2007.20598 89.9166645,2004.99998 M103.955674,2016.63598 C103.213556,2013.27698 100.892265,2010.79798 97.837022,2009.67298 C99.4560048,2008.39598 100.400241,2006.33098 100.053171,2004.06998 C99.6509769,2001.44698 97.4235996,1999.34798 94.7348224,1999.04198 C91.0232075,1998.61898 87.8750721,2001.44898 87.8750721,2004.99998 C87.8750721,2006.88998 88.7692896,2008.57398 90.1636971,2009.67298 C87.1074334,2010.79798 84.7871636,2013.27698 84.044024,2016.63598 C83.7745338,2017.85698 84.7789973,2018.99998 86.0539717,2018.99998 L101.945727,2018.99998 C103.221722,2018.99998 104.226185,2017.85698 103.955674,2016.63598"
                                            id="profile_round-[#1342]"> </path>
                                    </g>
                                </g>
                            </g>
                        </g>
                    </svg>
                </span>
            </button>
        </header>

        <!-- Search Bar -->
        <div class="search-section">
            <div class="search-bar">
                <input type="text" v-model="destination" placeholder="Where to ?" class="search-input" />
                <button class="pickup-button">Pickup Local</button>
            </div>
        </div>

        
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const destination = ref('')
const router = useRouter()

const goToProfile = () => {
    router.push('/profile')
}
</script>

<style scoped>
.home-container {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #f5f5f5;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    background-color: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.logo {
    font-size: 24px;
    font-weight: bold;
    color: #000000;
}

.profile-button {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    background-color: #f0f0f0;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.3s;
}

.profile-button:hover {
    background-color: #e0e0e0;
}

.profile-icon {
    font-size: 24px;
}

.search-section {
    padding: 20px 24px;
    background-color: #ffffff;
}

.search-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    background-color: #f8f8f8;
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-icon {
    font-size: 20px;
}

.search-input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 16px;
    outline: none;
    color: #333;
}

.search-input::placeholder {
    color: #999;
}

.pickup-button {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #000000;
    color: #ffffff;
    border: none;
    border-radius: 12px;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: background-color 0.3s;
}

.pickup-button:hover {
    background-color: #333333;
}

.map-container {
    flex: 1;
    position: relative;
    overflow: hidden;
}

.map-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.location-marker {
    position: absolute;
    top: 30%;
    left: 40%;
    font-size: 32px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.location-text {
    position: absolute;
    top: 45%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 28px;
    font-weight: bold;
    color: #d32f2f;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.route-line {
    position: absolute;
    top: 35%;
    left: 42%;
    width: 200px;
    height: 3px;
    background-color: #d32f2f;
    transform: rotate(-25deg);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.car-icon {
    position: absolute;
    top: 60%;
    right: 25%;
    font-size: 48px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.destination-marker {
    position: absolute;
    bottom: 20%;
    right: 20%;
    font-size: 32px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

/* Responsive */
@media (max-width: 768px) {
    .header {
        padding: 16px 20px;
    }

    .logo {
        font-size: 20px;
    }

    .profile-button {
        width: 44px;
        height: 44px;
    }

    .search-section {
        padding: 16px 20px;
    }

    .search-bar {
        flex-wrap: wrap;
    }

    .pickup-button {
        width: 100%;
        justify-content: center;
    }
}
</style>
