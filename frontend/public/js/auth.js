/* Auth helpers – session storage, navbar rendering, route guards */
var Auth = (function () {
    'use strict';

    function escapeHTML(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function getUser() {
        try {
            return JSON.parse(localStorage.getItem('user') || 'null');
        } catch (e) {
            return null;
        }
    }

    function getToken() {
        return localStorage.getItem('token');
    }

    function setAuth(token, user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    }

    function clearAuth() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    function roleHome(user) {
        return user.role === 'admin' ? 'admin.html' : 'dashboard.html';
    }

    /**
     * Ensures a user is logged in and (optionally) has the required role.
     * Redirects and returns null if the check fails; otherwise returns the user object.
     * @param {string} [requiredRole]
     * @returns {object|null}
     */
    function requireAuth(requiredRole) {
        var user = getUser();
        var token = getToken();
        if (!user || !token) {
            window.location.replace('login.html');
            return null;
        }
        if (requiredRole && user.role !== requiredRole) {
            window.location.replace(roleHome(user));
            return null;
        }
        return user;
    }

    function logout() {
        clearAuth();
        window.location.replace('login.html');
    }

    /**
     * Injects the shared navbar HTML into the element with id="main-navbar".
     * Attaches the logout event listener programmatically (no inline handlers).
     * @param {object} user
     */
    function renderNavbar(user) {
        var nav = document.getElementById('main-navbar');
        if (!nav || !user) { return; }
        nav.innerHTML =
            '<a class="navbar-brand" href="' + roleHome(user) + '">' +
                '<span class="navbar-icon">&#x1F9BA;</span>' +
                '<span class="navbar-title">Wearable Monitor</span>' +
            '</a>' +
            '<div class="navbar-right">' +
                '<span class="navbar-user">&#x1F464; ' + escapeHTML(user.name) + '</span>' +
                '<span class="navbar-role role-' + escapeHTML(user.role) + '">' +
                    escapeHTML(user.role.toUpperCase()) +
                '</span>' +
                '<button class="btn btn-logout" id="navbar-logout-btn">Logout</button>' +
            '</div>';
        document.getElementById('navbar-logout-btn').addEventListener('click', logout);
    }

    return {
        getUser: getUser,
        getToken: getToken,
        setAuth: setAuth,
        clearAuth: clearAuth,
        requireAuth: requireAuth,
        logout: logout,
        renderNavbar: renderNavbar
    };
}());
