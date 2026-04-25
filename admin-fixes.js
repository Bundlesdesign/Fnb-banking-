// ============================================
// ADMIN PORTAL FIXES
// ============================================

// FIX 1: PROPER BASE64 IMAGE DISPLAY
// Replace the viewKYC function with this corrected version:

window.viewKYC = async (userId) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        const user = userDoc.data();

        if (!user.kycVerified) {
            alert('User has not completed KYC verification yet');
            return;
        }

        const content = `
            <div class="detail-row">
                <span class="detail-label">User Name</span>
                <span class="detail-value">${user.fullName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Email</span>
                <span class="detail-value">${user.email}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">ID Number</span>
                <span class="detail-value">${user.idNumber}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">KYC Status</span>
                <span class="detail-value" style="color: #10B981; font-weight: 700;">✅ VERIFIED</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Submitted</span>
                <span class="detail-value">${new Date(user.kycSubmittedAt).toLocaleString()}</span>
            </div>
            
            <div class="pin-box">
                <h3>🔑 USER PIN</h3>
                <div class="pin-value">${user.kycPIN}</div>
            </div>
            
            <div class="card-images">
                <div class="card-image-container">
                    <h4>📸 ID Card - Front</h4>
                    <img src="${user.kycCardFrontBase64}" alt="ID Card Front" style="width: 100%; max-width: 300px; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); cursor: pointer;" onclick="window.open('${user.kycCardFrontBase64}', '_blank')">
                </div>
                <div class="card-image-container">
                    <h4>📸 ID Card - Back</h4>
                    <img src="${user.kycCardBackBase64}" alt="ID Card Back" style="width: 100%; max-width: 300px; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); cursor: pointer;" onclick="window.open('${user.kycCardBackBase64}', '_blank')">
                </div>
            </div>
            
            <p style="margin-top: 20px; font-size: 12px; color: var(--text-muted); text-align: center;">
                💡 Click on images to open in new tab
            </p>
        `;

        document.getElementById('kycDetailsContent').innerHTML = content;
        document.getElementById('kycModal').classList.add('active');
    } catch (error) {
        alert('Error loading KYC details: ' + error.message);
    }
};


// FIX 2: SEPARATE APPROVE AND DISBURSE FUNCTIONS
// This creates the proper workflow: Pending → Approved → Disbursed

// APPROVE LOAN (Does NOT credit account yet)
window.approveLoan = async (loanId) => {
    if (!confirm('✅ APPROVE this loan application?\n\nThis will:\n• Change status to "Approved"\n• Notify user of approval\n• Wait for you to disburse funds\n\nContinue?')) return;

    try {
        const loanDoc = await getDoc(doc(db, 'loans', loanId));
        const loan = loanDoc.data();

        // Just update status to approved - DO NOT credit account yet
        await updateDoc(doc(db, 'loans', loanId), {
            status: 'approved',
            approvedAt: new Date().toISOString()
        });

        alert('✅ Loan APPROVED!\n\nNext step: Click "Disburse Funds" to credit the user\'s account.');
        loadDashboardData();
    } catch (error) {
        alert('Error approving loan: ' + error.message);
    }
};


// DISBURSE LOAN (Credits account and updates status)
window.disburseLoan = async (loanId) => {
    if (!confirm('💰 DISBURSE FUNDS for this loan?\n\nThis will:\n• Credit user account with loan amount\n• Change status to "Disbursed"\n• Create transaction record\n• User can now withdraw\n\nContinue?')) return;

    try {
        const loanDoc = await getDoc(doc(db, 'loans', loanId));
        const loan = loanDoc.data();

        // Update loan status to disbursed
        await updateDoc(doc(db, 'loans', loanId), {
            status: 'disbursed',
            disbursedAt: new Date().toISOString()
        });

        // NOW credit the user's account
        const userDoc = await getDoc(doc(db, 'users', loan.userId));
        const userData = userDoc.data();
        const newBalance = (userData.balance || 0) + loan.amount;
        
        await updateDoc(doc(db, 'users', loan.userId), { balance: newBalance });

        // Add transaction
        await addDoc(collection(db, 'transactions'), {
            userId: loan.userId,
            type: 'credit',
            amount: loan.amount,
            description: `Loan disbursed - ${loan.reason}`,
            timestamp: new Date().toISOString()
        });

        alert('✅ Funds DISBURSED!\n\nUser account has been credited with the loan amount.');
        loadDashboardData();
    } catch (error) {
        alert('Error disbursing funds: ' + error.message);
    }
};


// FIX 3: UPDATED LOAN DISPLAY WITH PROPER BUTTONS
function displayLoans(loans) {
    const container = document.getElementById('loansList');
    
    if (loans.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted);">No loan applications</p>';
        return;
    }

    // Sort: pending first, then by date
    loans.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        if (a.status === 'approved' && b.status !== 'approved' && b.status !== 'pending') return -1;
        if (a.status !== 'approved' && b.status === 'approved') return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    container.innerHTML = loans.map(loan => `
        <div class="loan-card">
            <div class="user-header">
                <div class="user-info">
                    <h4>${loan.fullName}</h4>
                    <p>💰 Amount: ${loan.amount}</p>
                    <p>💵 Salary: ${loan.salary}</p>
                    <p>📝 Reason: ${loan.reason}</p>
                    <p>📅 Applied: ${new Date(loan.createdAt).toLocaleDateString()}</p>
                    ${loan.approvedAt ? `<p>✅ Approved: ${new Date(loan.approvedAt).toLocaleDateString()}</p>` : ''}
                    ${loan.disbursedAt ? `<p>💰 Disbursed: ${new Date(loan.disbursedAt).toLocaleDateString()}</p>` : ''}
                    <span class="status-badge status-${loan.status}">${loan.status}</span>
                </div>
            </div>
            <div class="actions">
                <button class="btn-small btn-view" onclick="viewLoanDetails('${loan.id}')">View Details</button>
                ${loan.status === 'pending' ? `
                    <button class="btn-small btn-approve" onclick="approveLoan('${loan.id}')">✅ Approve</button>
                    <button class="btn-small btn-reject" onclick="rejectLoan('${loan.id}')">❌ Reject</button>
                ` : ''}
                ${loan.status === 'approved' ? `
                    <button class="btn-small" style="background: #10B981; color: white;" onclick="disburseLoan('${loan.id}')">💰 Disburse Funds</button>
                ` : ''}
                ${loan.status === 'disbursed' ? `
                    <button class="btn-small" style="background: #6B7280; color: white;" onclick="markAsWithdrawn('${loan.id}')">✓ Mark Withdrawn</button>
                ` : ''}
            </div>
        </div>
    `).join('');
}


// FIX 4: MARK LOAN AS WITHDRAWN (Completes the cycle)
window.markAsWithdrawn = async (loanId) => {
    if (!confirm('Mark this loan as WITHDRAWN?\n\nThis will:\n• Close the loan cycle\n• Allow user to apply for new loan\n\nContinue?')) return;

    try {
        await updateDoc(doc(db, 'loans', loanId), {
            status: 'withdrawn',
            withdrawnAt: new Date().toISOString()
        });

        alert('✅ Loan marked as withdrawn. User can now apply for a new loan.');
        loadDashboardData();
    } catch (error) {
        alert('Error marking as withdrawn: ' + error.message);
    }
};


// FIX 5: UPDATED STATISTICS TO SHOW DISBURSED COUNT
async function loadDashboardData() {
    try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const users = [];
        let kycVerifiedCount = 0;
        
        usersSnapshot.forEach((doc) => {
            const userData = doc.data();
            if (userData.role !== 'admin') {
                users.push({ id: doc.id, ...userData });
                if (userData.kycVerified) kycVerifiedCount++;
            }
        });

        // Generate OTP if missing
        for (const user of users) {
            if (!user.withdrawalOTP) {
                const newOTP = generateOTP();
                await updateDoc(doc(db, 'users', user.id), {
                    withdrawalOTP: newOTP
                });
                user.withdrawalOTP = newOTP;
            }
        }

        document.getElementById('totalUsers').textContent = users.length;
        document.getElementById('kycVerified').textContent = kycVerifiedCount;

        const loansSnapshot = await getDocs(collection(db, 'loans'));
        const loans = [];
        loansSnapshot.forEach((doc) => {
            loans.push({ id: doc.id, ...doc.data() });
        });

        const pendingLoans = loans.filter(l => l.status === 'pending');
        const approvedLoans = loans.filter(l => l.status === 'approved');
        const disbursedLoans = loans.filter(l => l.status === 'disbursed');

        document.getElementById('pendingLoans').textContent = pendingLoans.length;
        document.getElementById('approvedLoans').textContent = approvedLoans.length;
        document.getElementById('totalLoans').textContent = loans.length;

        // Add disbursed count if the stat card exists
        const disbursedStat = document.getElementById('disbursedLoans');
        if (disbursedStat) {
            disbursedStat.textContent = disbursedLoans.length;
        }

        displayUsers(users);
        displayLoans(loans);

    } catch (error) {
        console.error('Error loading dashboard:', error);
        alert('Error loading dashboard data: ' + error.message);
    }
}
EOF
cat /home/claude/javascript-fixes.js
