// 1. Select HTML Elements

const searchForm =
    document.getElementById("searchForm");

const usernameInput =
    document.getElementById("usernameInput");

const searchButton =
    document.getElementById("searchButton");

const statusMessage =
    document.getElementById("statusMessage");

const profileCard =
    document.getElementById("profileCard");

const avatar =
    document.getElementById("avatar");

const nameElement =
    document.getElementById("name");

const usernameElement =
    document.getElementById("username");

const profileLink =
    document.getElementById("profileLink");

const bio =
    document.getElementById("bio");

const locationElement =
    document.getElementById("location");

const joined =
    document.getElementById("joined");

const repositories =
    document.getElementById("repositories");

const followers =
    document.getElementById("followers");

const following =
    document.getElementById("following");


// 2. Display Status Message

function showMessage(message, type) {

    statusMessage.textContent = message;

    statusMessage.className = type;

}


// 3. Format Date

function formatDate(dateString) {

    const date = new Date(dateString);

    return new Intl.DateTimeFormat("en-US", {

        year: "numeric",

        month: "long",

        day: "numeric"

    }).format(date);

}


// 4. Get GitHub User

async function getGitHubUser(username) {


    // Create API URL

    const apiURL =

        `https://api.github.com/users/${encodeURIComponent(username)}`;


    // Send Request

    const response = await fetch(apiURL);


    // Check Response

    if (response.status === 404) {

        throw new Error("GitHub user not found.");

    }


    if (response.status === 403) {

        throw new Error(
            "API request limit reached. Try again later."
        );

    }


    if (!response.ok) {

        throw new Error(
            "Something went wrong. Please try again."
        );

    }


    // Convert JSON to JavaScript Object

    const user = await response.json();


    return user;

}


// 5. Display GitHub Profile

function displayProfile(user) {


    // Display Avatar

    avatar.src = user.avatar_url;

    avatar.alt = `${user.login}'s GitHub avatar`;


    // Display Name

    nameElement.textContent =

        user.name || "Name not available";


    // Display Username

    usernameElement.textContent =

        "@" + user.login;


    // Display Profile Link

    profileLink.href = user.html_url;


    // Display Bio

    bio.textContent =

        user.bio || "No bio available.";


    // Display Location

    locationElement.textContent =

        user.location || "Not available";


    // Display Joined Date

    joined.textContent = formatDate(user.created_at);


    // Display Statistics

    repositories.textContent =

        user.public_repos;


    followers.textContent =

        user.followers;


    following.textContent =

        user.following;


    // Show Profile Card

    profileCard.hidden = false;

}


// 6. Search Form Event

searchForm.addEventListener("submit", async function(event) {


    // Prevent Page Refresh

    event.preventDefault();


    // Get Username

    const username = usernameInput.value.trim();


    // Check Empty Input

    if (username === "") {

        profileCard.hidden = true;

        showMessage(
            "Please enter a GitHub username.",
            "error"
        );

        return;

    }


    // Start Loading

    searchButton.disabled = true;

    searchButton.textContent = "Searching...";

    profileCard.hidden = true;


    showMessage(

        "Loading GitHub profile...",

        "loading"

    );


    try {


        // Get User Data

        const user = await getGitHubUser(username);


        // Display User Data

        displayProfile(user);


        showMessage(

            "Profile loaded successfully!",

            "success"

        );

    }


    catch (error) {


        // Display Error

        showMessage(

            error.message,

            "error"

        );


        console.error("GitHub API Error:", error);

    }


    finally {


        // Stop Loading

        searchButton.disabled = false;

        searchButton.textContent = "Search";

    }

});