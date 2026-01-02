// admin-chat.js
// Sistem Login Admin untuk Live Chat

class AdminChatSystem {
    constructor() {
        this.isAdminLoggedIn = false;
        this.adminUsername = '';
        this.currentAdmin = null;
        this.pendingMessages = [];
        this.activeChats = new Map();
        
        // Default admin credentials (bisa diubah)
        this.adminCredentials = [
            { username: 'admin', password: 'admin123', name: 'Super Admin' },
            { username: 'cs1', password: 'cs123', name: 'Customer Service 1' },
            { username: 'cs2', password: 'cs456', name: 'Customer Service 2' }
        ];
        
        this.init();
    }
    
    init() {
        this.createAdminPanel();
        this.setupEventListeners();
        this.checkAutoLogin();
        this.startMessageChecker();
    }
    
    createAdminPanel() {
        // Login Modal
        const loginModalHTML = `
            <div class="admin-login-modal" id="adminLoginModal">
                <div class="login-container">
                    <div class="login-header">
                        <h2><i class="fas fa-lock"></i> Admin Login</h2>
                        <p>Login untuk membalas pesan live chat</p>
                    </div>
                    
                    <div class="login-form">
                        <div class="form-group">
                            <label for="adminUsername">
                                <i class="fas fa-user"></i> Username
                            </label>
                            <input type="text" 
                                   id="adminUsername" 
                                   placeholder="Masukkan username"
                                   autocomplete="username">
                        </div>
                        
                        <div class="form-group">
                            <label for="adminPassword">
                                <i class="fas fa-key"></i> Password
                            </label>
                            <input type="password" 
                                   id="adminPassword" 
                                   placeholder="Masukkan password"
                                   autocomplete="current-password">
                        </div>
                        
                        <div class="form-options">
                            <label class="remember-me">
                                <input type="checkbox" id="rememberLogin">
                                <span>Ingat saya</span>
                            </label>
                            <a href="#" class="forgot-password">Lupa password?</a>
                        </div>
                        
                        <button class="login-btn" id="adminLoginBtn">
                            <i class="fas fa-sign-in-alt"></i> Login
                        </button>
                        
                        <div class="login-footer">
                            <p>Demo login: admin / admin123</p>
                            <div class="quick-logins">
                                <button class="quick-login" data-user="admin" data-pass="admin123">
                                    Login sebagai Admin
                                </button>
                                <button class="quick-login" data-user="cs1" data-pass="cs123">
                                    Login sebagai CS1
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Admin Dashboard
        const adminDashboardHTML = `
            <div class="admin-dashboard" id="adminDashboard">
                <div class="dashboard-header">
                    <div class="admin-info">
                        <div class="admin-avatar">
                            <i class="fas fa-user-shield"></i>
                        </div>
                        <div class="admin-details">
                            <h3 id="adminGreeting">Halo, Admin</h3>
                            <p class="admin-role" id="adminRole">Customer Service</p>
                        </div>
                    </div>
                    <button class="logout-btn" id="adminLogoutBtn">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
                
                <div class="dashboard-stats">
                    <div class="stat-card">
                        <div class="stat-icon new">
                            <i class="fas fa-comment-dots"></i>
                        </div>
                        <div class="stat-info">
                            <h4 id="newMessages">0</h4>
                            <p>Pesan Baru</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon active">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-info">
                            <h4 id="activeChats">0</h4>
                            <p>Chat Aktif</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon total">
                            <i class="fas fa-history"></i>
                        </div>
                        <div class="stat-info">
                            <h4 id="totalMessages">0</h4>
                            <p>Total Pesan</p>
                        </div>
                    </div>
                </div>
                
                <div class="chat-manager">
                    <div class="section-header">
                        <h3><i class="fas fa-comments"></i> Kelola Chat</h3>
                        <div class="section-actions">
                            <button class="refresh-btn" id="refreshChats">
                                <i class="fas fa-sync-alt"></i> Refresh
                            </button>
                            <button class="export-btn" id="exportChats">
                                <i class="fas fa-download"></i> Export
                            </button>
                        </div>
                    </div>
                    
                    <div class="chats-list" id="chatsList">
                        <!-- Daftar chat akan muncul di sini -->
                        <div class="no-chats">
                            <i class="fas fa-inbox"></i>
                            <p>Belum ada chat aktif</p>
                        </div>
                    </div>
                </div>
                
                <div class="active-chat-area" id="activeChatArea">
                    <div class="no-chat-selected">
                        <i class="fas fa-comment-slash"></i>
                        <h4>Pilih chat untuk mulai membalas</h4>
                        <p>Klik salah satu chat dari daftar di samping</p>
                    </div>
                </div>
            </div>
        `;
        
        // Tambahkan ke body
        document.body.insertAdjacentHTML('beforeend', loginModalHTML);
        document.body.insertAdjacentHTML('beforeend', adminDashboardHTML);
        
        // Sembunyikan dashboard awal
        document.getElementById('adminDashboard').style.display = 'none';
    }
    
    setupEventListeners() {
        // Login button
        document.getElementById('adminLoginBtn').addEventListener('click', () => this.login());
        
        // Enter key untuk login
        document.getElementById('adminPassword').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.login();
        });
        
        // Quick login buttons
        document.querySelectorAll('.quick-login').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const username = e.target.dataset.user;
                const password = e.target.dataset.pass;
                document.getElementById('adminUsername').value = username;
                document.getElementById('adminPassword').value = password;
                this.login();
            });
        });
        
        // Logout button
        document.getElementById('adminLogoutBtn').addEventListener('click', () => this.logout());
        
        // Refresh chats
        document.getElementById('refreshChats').addEventListener('click', () => this.loadChats());
        
        // Export chats
        document.getElementById('exportChats').addEventListener('click', () => this.exportChats());
    }
    
    login() {
        const username = document.getElementById('adminUsername').value.trim();
        const password = document.getElementById('adminPassword').value;
        const rememberMe = document.getElementById('rememberLogin').checked;
        
        // Validasi
        if (!username || !password) {
            this.showAlert('error', 'Username dan password harus diisi');
            return;
        }
        
        // Cek credentials
        const admin = this.adminCredentials.find(
            cred => cred.username === username && cred.password === password
        );
        
        if (admin) {
            // Login berhasil
            this.isAdminLoggedIn = true;
            this.adminUsername = username;
            this.currentAdmin = admin;
            
            // Simpan session
            if (rememberMe) {
                localStorage.setItem('adminSession', JSON.stringify({
                    username: admin.username,
                    name: admin.name,
                    timestamp: Date.now()
                }));
            } else {
                sessionStorage.setItem('adminSession', JSON.stringify({
                    username: admin.username,
                    name: admin.name,
                    timestamp: Date.now()
                }));
            }
            
            // Update UI
            this.showAdminDashboard();
            this.showAlert('success', `Login berhasil! Selamat datang ${admin.name}`);
            
            // Load chats
            this.loadChats();
            
        } else {
            this.showAlert('error', 'Username atau password salah');
        }
    }
    
    logout() {
        this.isAdminLoggedIn = false;
        this.adminUsername = '';
        this.currentAdmin = null;
        
        // Hapus session
        localStorage.removeItem('adminSession');
        sessionStorage.removeItem('adminSession');
        
        // Update UI
        this.hideAdminDashboard();
        this.showAlert('info', 'Anda telah logout');
    }
    
    showAdminDashboard() {
        // Update admin info
        document.getElementById('adminGreeting').textContent = `Halo, ${this.currentAdmin.name}`;
        document.getElementById('adminRole').textContent = this.getAdminRole(this.currentAdmin.username);
        
        // Show dashboard
        document.getElementById('adminLoginModal').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'flex';
        
        // Tambahkan tombol admin di live chat jika ada
        this.addAdminButtonToChat();
    }
    
    hideAdminDashboard() {
        document.getElementById('adminLoginModal').style.display = 'flex';
        document.getElementById('adminDashboard').style.display = 'none';
        
        // Reset form
        document.getElementById('adminUsername').value = '';
        document.getElementById('adminPassword').value = '';
        document.getElementById('rememberLogin').checked = false;
    }
    
    addAdminButtonToChat() {
        // Cari elemen chat header
        const chatHeader = document.querySelector('.chat-header');
        if (chatHeader && !chatHeader.querySelector('.admin-reply-btn')) {
            const adminBtn = document.createElement('button');
            adminBtn.className = 'admin-reply-btn';
            adminBtn.innerHTML = '<i class="fas fa-user-shield"></i> Admin Reply';
            adminBtn.title = 'Balas sebagai Admin';
            
            adminBtn.addEventListener('click', () => {
                if (this.isAdminLoggedIn) {
                    this.openAdminReplyBox();
                } else {
                    this.showAlert('warning', 'Silakan login sebagai admin terlebih dahulu');
                }
            });
            
            chatHeader.appendChild(adminBtn);
        }
    }
    
    openAdminReplyBox() {
        // Ambil pesan terakhir dari user
        const userMessages = document.querySelectorAll('.message.user');
        const lastUserMessage = userMessages[userMessages.length - 1];
        
        if (!lastUserMessage) {
            this.showAlert('info', 'Belum ada pesan dari user');
            return;
        }
        
        // Buat reply box
        const replyBoxHTML = `
            <div class="admin-reply-box" id="adminReplyBox">
                <div class="reply-header">
                    <h4><i class="fas fa-reply"></i> Balas sebagai Admin</h4>
                    <button class="close-reply">&times;</button>
                </div>
                <div class="original-message">
                    <strong>Pesan User:</strong>
                    <p>${lastUserMessage.querySelector('.message-text').textContent}</p>
                </div>
                <textarea id="adminReplyText" 
                          placeholder="Ketik balasan Anda di sini..." 
                          rows="4"></textarea>
                <div class="reply-actions">
                    <button class="btn-cancel">Batal</button>
                    <button class="btn-send-reply">
                        <i class="fas fa-paper-plane"></i> Kirim Balasan
                    </button>
                </div>
            </div>
        `;
        
        // Tambahkan ke chat messages
        const chatMessages = document.querySelector('.chat-messages');
        chatMessages.insertAdjacentHTML('beforeend', replyBoxHTML);
        
        // Scroll ke bawah
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Setup event listeners
        document.querySelector('.close-reply').addEventListener('click', () => {
            document.getElementById('adminReplyBox').remove();
        });
        
        document.querySelector('.btn-cancel').addEventListener('click', () => {
            document.getElementById('adminReplyBox').remove();
        });
        
        document.querySelector('.btn-send-reply').addEventListener('click', () => {
            this.sendAdminReply();
        });
        
        // Focus ke textarea
        document.getElementById('adminReplyText').focus();
    }
    
    sendAdminReply() {
        const replyText = document.getElementById('adminReplyText').value.trim();
        
        if (!replyText) {
            this.showAlert('error', 'Balasan tidak boleh kosong');
            return;
        }
        
        // Kirim balasan ke chat
        const chatMessages = document.querySelector('.chat-messages');
        const adminReplyHTML = `
            <div class="message bot admin-reply">
                <div class="avatar bot">
                    <i class="fas fa-user-shield"></i>
                </div>
                <div class="message-content">
                    <div class="message-text">
                        <span class="admin-badge">ADMIN</span><br>
                        ${this.escapeHtml(replyText)}
                    </div>
                    <div class="message-time">
                        ${new Date().toLocaleTimeString('id-ID', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        })}
                        <span class="admin-name"> - ${this.currentAdmin.name}</span>
                    </div>
                </div>
            </div>
        `;
        
        chatMessages.insertAdjacentHTML('beforeend', adminReplyHTML);
        
        // Hapus reply box
        document.getElementById('adminReplyBox').remove();
        
        // Simpan ke history
        this.saveAdminReply(replyText);
        
        this.showAlert('success', 'Balasan berhasil dikirim!');
        
        // Scroll ke bawah
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    loadChats() {
        // Simulasi loading chats dari localStorage
        const chats = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        
        // Update stats
        document.getElementById('newMessages').textContent = chats.filter(c => !c.read).length;
        document.getElementById('activeChats').textContent = Object.keys(this.activeChats).length;
        document.getElementById('totalMessages').textContent = chats.length;
        
        // Tampilkan chats list
        this.displayChatsList(chats);
    }
    
    displayChatsList(chats) {
        const chatsList = document.getElementById('chatsList');
        
        if (chats.length === 0) {
            chatsList.innerHTML = `
                <div class="no-chats">
                    <i class="fas fa-inbox"></i>
                    <p>Belum ada chat aktif</p>
                </div>
            `;
            return;
        }
        
        // Group chats by user
        const userChats = this.groupChatsByUser(chats);
        
        let html = '';
        Object.entries(userChats).forEach(([userId, userData], index) => {
            const lastMessage = userData.messages[userData.messages.length - 1];
            const unreadCount = userData.messages.filter(m => !m.read).length;
            
            html += `
                <div class="chat-item ${unreadCount > 0 ? 'unread' : ''}" 
                     data-user-id="${userId}">
                    <div class="chat-avatar">
                        <i class="fas fa-user"></i>
                        ${unreadCount > 0 ? `<span class="unread-badge">${unreadCount}</span>` : ''}
                    </div>
                    <div class="chat-info">
                        <div class="chat-header">
                            <h4>User ${index + 1}</h4>
                            <span class="chat-time">${this.formatTime(lastMessage.timestamp)}</span>
                        </div>
                        <p class="chat-preview">${this.truncateText(lastMessage.text, 50)}</p>
                    </div>
                    <button class="open-chat-btn" data-user-id="${userId}">
                        <i class="fas fa-comment"></i>
                    </button>
                </div>
            `;
        });
        
        chatsList.innerHTML = html;
        
        // Add event listeners
        document.querySelectorAll('.open-chat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.target.closest('.open-chat-btn').dataset.userId;
                this.openUserChat(userId, userChats[userId]);
            });
        });
    }
    
    openUserChat(userId, userData) {
        const activeChatArea = document.getElementById('activeChatArea');
        
        let messagesHtml = '';
        userData.messages.forEach(msg => {
            const isUser = msg.sender === 'user';
            messagesHtml += `
                <div class="chat-message ${isUser ? 'user-msg' : 'admin-msg'}">
                    <div class="message-avatar">
                        <i class="fas ${isUser ? 'fa-user' : 'fa-user-shield'}"></i>
                    </div>
                    <div class="message-content">
                        <div class="message-text">${this.escapeHtml(msg.text)}</div>
                        <div class="message-time">
                            ${this.formatTime(msg.timestamp)}
                            ${!isUser ? `<span class="admin-name"> - ${msg.adminName || 'System'}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        
        activeChatArea.innerHTML = `
            <div class="active-chat-header">
                <div class="chat-user-info">
                    <div class="user-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div>
                        <h4>User ${userId.replace('user_', '')}</h4>
                        <p class="user-status">Aktif sekarang</p>
                    </div>
                </div>
                <button class="close-chat-view">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="chat-messages-container" id="userChatMessages">
                ${messagesHtml}
            </div>
            
            <div class="chat-reply-box">
                <textarea id="userChatReply" 
                          placeholder="Ketik balasan untuk user ini..." 
                          rows="3"></textarea>
                <button class="send-user-reply" data-user-id="${userId}">
                    <i class="fas fa-paper-plane"></i> Kirim
                </button>
            </div>
        `;
        
        // Scroll to bottom
        const messagesContainer = document.getElementById('userChatMessages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Event listeners
        document.querySelector('.close-chat-view').addEventListener('click', () => {
            this.closeUserChat();
        });
        
        document.querySelector('.send-user-reply').addEventListener('click', (e) => {
            this.sendUserChatReply(userId);
        });
        
        document.getElementById('userChatReply').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendUserChatReply(userId);
            }
        });
    }
    
    sendUserChatReply(userId) {
        const replyText = document.getElementById('userChatReply').value.trim();
        
        if (!replyText) {
            this.showAlert('error', 'Pesan tidak boleh kosong');
            return;
        }
        
        // Simpan reply
        const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        chatHistory.push({
            userId: userId,
            text: replyText,
            sender: 'admin',
            adminName: this.currentAdmin.name,
            timestamp: new Date().toISOString(),
            read: true
        });
        
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
        
        // Update UI
        const messagesContainer = document.getElementById('userChatMessages');
        const messageHTML = `
            <div class="chat-message admin-msg">
                <div class="message-avatar">
                    <i class="fas fa-user-shield"></i>
                </div>
                <div class="message-content">
                    <div class="message-text">${this.escapeHtml(replyText)}</div>
                    <div class="message-time">
                        ${new Date().toLocaleTimeString('id-ID', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        })}
                        <span class="admin-name"> - ${this.currentAdmin.name}</span>
                    </div>
                </div>
            </div>
        `;
        
        messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
        document.getElementById('userChatReply').value = '';
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        this.showAlert('success', 'Pesan terkirim ke user');
    }
    
    closeUserChat() {
        document.getElementById('activeChatArea').innerHTML = `
            <div class="no-chat-selected">
                <i class="fas fa-comment-slash"></i>
                <h4>Pilih chat untuk mulai membalas</h4>
                <p>Klik salah satu chat dari daftar di samping</p>
            </div>
        `;
    }
    
    exportChats() {
        const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        
        if (chatHistory.length === 0) {
            this.showAlert('info', 'Tidak ada chat untuk diexport');
            return;
        }
        
        // Format data untuk export
        const exportData = {
            exportedAt: new Date().toISOString(),
            exportedBy: this.currentAdmin.name,
            totalMessages: chatHistory.length,
            chats: chatHistory
        };
        
        // Convert to JSON
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        // Create download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `chat-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showAlert('success', 'Chat berhasil diexport');
    }
    
    checkAutoLogin() {
        // Cek localStorage dulu
        let session = localStorage.getItem('adminSession');
        if (!session) {
            // Cek sessionStorage
            session = sessionStorage.getItem('adminSession');
        }
        
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                const age = Date.now() - sessionData.timestamp;
                
                // Auto login jika session kurang dari 24 jam
                if (age < 24 * 60 * 60 * 1000) {
                    const admin = this.adminCredentials.find(
                        cred => cred.username === sessionData.username
                    );
                    
                    if (admin) {
                        this.isAdminLoggedIn = true;
                        this.adminUsername = admin.username;
                        this.currentAdmin = admin;
                        this.showAdminDashboard();
                        this.loadChats();
                    }
                }
            } catch (e) {
                console.error('Error loading session:', e);
            }
        }
    }
    
    startMessageChecker() {
        // Check for new messages every 10 seconds
        setInterval(() => {
            if (this.isAdminLoggedIn) {
                this.loadChats();
            }
        }, 10000);
    }
    
    // Helper methods
    groupChatsByUser(chats) {
        const grouped = {};
        
        chats.forEach(chat => {
            const userId = chat.userId || 'user_1';
            if (!grouped[userId]) {
                grouped[userId] = {
                    userId: userId,
                    messages: []
                };
            }
            grouped[userId].messages.push(chat);
        });
        
        return grouped;
    }
    
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60 * 1000) return 'Baru saja';
        if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))} menit lalu`;
        if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))} jam lalu`;
        
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    getAdminRole(username) {
        if (username === 'admin') return 'Super Admin';
        if (username.startsWith('cs')) return 'Customer Service';
        return 'Staff';
    }
    
    saveAdminReply(replyText) {
        // Simpan balasan admin ke history
        const replyData = {
            text: replyText,
            admin: this.currentAdmin.name,
            timestamp: new Date().toISOString(),
            type: 'admin_reply'
        };
        
        // Simpan ke localStorage
        let adminReplies = JSON.parse(localStorage.getItem('adminReplies') || '[]');
        adminReplies.push(replyData);
        localStorage.setItem('adminReplies', JSON.stringify(adminReplies));
    }
    
    showAlert(type, message) {
        // Hapus alert sebelumnya
        const existingAlert = document.querySelector('.admin-alert');
        if (existingAlert) existingAlert.remove();
        
        const alertHTML = `
            <div class="admin-alert alert-${type}">
                <i class="fas ${this.getAlertIcon(type)}"></i>
                <span>${message}</span>
                <button class="close-alert">&times;</button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', alertHTML);
        
        // Auto remove setelah 5 detik
        setTimeout(() => {
            const alert = document.querySelector('.admin-alert');
            if (alert) alert.remove();
        }, 5000);
        
        // Close button
        document.querySelector('.close-alert')?.addEventListener('click', function() {
            this.parentElement.remove();
        });
    }
    
    getAlertIcon(type) {
        switch(type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'warning': return 'fa-exclamation-triangle';
            case 'info': return 'fa-info-circle';
            default: return 'fa-info-circle';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.adminChatSystem = new AdminChatSystem();
    
    // Tambahkan tombol akses admin di halaman
    const adminAccessBtn = document.createElement('button');
    adminAccessBtn.id = 'adminAccessBtn';
    adminAccessBtn.innerHTML = '<i class="fas fa-user-shield"></i>';
    adminAccessBtn.title = 'Akses Admin Chat';
    adminAccessBtn.className = 'admin-access-btn';
    
    adminAccessBtn.addEventListener('click', () => {
        // Tampilkan login modal
        document.getElementById('adminLoginModal').style.display = 'flex';
    });
    
    document.body.appendChild(adminAccessBtn);
});

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminChatSystem;
}