// ============================================
// FIXES FOR FNB BANKING SYSTEM
// ============================================

// FIX 1: SIMPLIFIED LOAN APPLICATION FLOW
// Replace the checkLoanEligibility function with this:

window.showLoanForm = () => {
    document.getElementById('homeView').classList.add('hidden');
    document.getElementById('loanFormView').classList.remove('hidden');
    document.getElementById('kycFormView').classList.add('hidden');
    document.getElementById('loanTrackerView').classList.add('hidden');
    document.getElementById('backBtn').classList.remove('hidden');
};

// Update the category card onclick to directly call showLoanForm
// Change this line:
// <div class="category-card" id="loanCategoryCard" onclick="checkLoanEligibility()">
// To this:
// <div class="category-card" id="loanCategoryCard" onclick="showLoanForm()">


// FIX 2: WORKING LOAN SUBMISSION WITH PROPER STATUS FLOW
// Replace the loan submission handler:

document.getElementById('loanApplicationForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        const submitBtn = document.getElementById('loanSubmitBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        
        showSpinner('Submitting loan application...');

        const loanData = {
            userId: currentUser.uid,
            fullName: document.getElementById('loanFullName').value,
            idNumber: document.getElementById('loanIdNumber').value,
            address: document.getElementById('loanAddress').value,
            amount: parseFloat(document.getElementById('loanAmount').value),
            reason: document.getElementById('loanReason').value,
            salary: parseFloat(document.getElementById('loanSalary').value),
            payDate: parseInt(document.getElementById('loanPayDate').value),
            email: document.getElementById('loanEmail').value,
            dob: document.getElementById('loanDOB').value,
            gender: document.getElementById('loanGender').value,
            status: 'pending',  // Always starts as pending
            createdAt: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, 'loans'), loanData);
        
        hideSpinner();
        showToast('Application Submitted!', 'Your loan is pending approval');
        
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Application';
        
        // Clear form
        document.getElementById('loanApplicationForm').reset();
        
        // Navigate back and show status
        setTimeout(() => {
            navigateBack();
            // Show the tracker
            setTimeout(() => showLoanStatus(docRef.id), 500);
        }, 1500);
        
    } catch (error) {
        hideSpinner();
        console.error('Loan submission error:', error);
        alert('Error submitting application: ' + error.message);
        document.getElementById('loanSubmitBtn').disabled = false;
        document.getElementById('loanSubmitBtn').textContent = 'Submit Application';
    }
});


// FIX 3: SHOW LOAN STATUS AFTER SUBMISSION
async function showLoanStatus(loanId) {
    const loanDoc = await getDoc(doc(db, 'loans', loanId));
    if (loanDoc.exists()) {
        const loan = loanDoc.data();
        currentLoanStatus = loan;
        
        document.getElementById('homeView').classList.add('hidden');
        document.getElementById('loanTrackerView').classList.remove('hidden');
        document.getElementById('backBtn').classList.remove('hidden');
        
        updateLoanTracker(loan);
        
        // Listen for status changes
        onSnapshot(doc(db, 'loans', loanId), (doc) => {
            if (doc.exists()) {
                updateLoanTracker(doc.data());
            }
        });
    }
}


// FIX 4: UPDATED LOAN TRACKER TO SHOW ALL STATUSES
function updateLoanTracker(loan) {
    const pendingCircle = document.getElementById('stepPending');
    const approvedCircle = document.getElementById('stepApproved');
    const disbursedCircle = document.getElementById('stepDisbursed');
    const progressBar = document.getElementById('trackerProgressBar');
    const subtitle = document.getElementById('trackerSubtitle');

    // Reset all circles
    [pendingCircle, approvedCircle, disbursedCircle].forEach(el => {
        el.className = 'step-circle';
    });

    // Update based on status
    if (loan.status === 'pending') {
        pendingCircle.classList.add('pending');
        progressBar.style.width = '0%';
        subtitle.textContent = '⏳ Your application is under review by our team';
    } else if (loan.status === 'approved') {
        pendingCircle.classList.add('completed');
        approvedCircle.classList.add('approved');
        progressBar.style.width = '50%';
        subtitle.textContent = '✅ Congratulations! Your loan has been approved. Funds will be disbursed soon.';
    } else if (loan.status === 'disbursed') {
        pendingCircle.classList.add('completed');
        approvedCircle.classList.add('completed');
        disbursedCircle.classList.add('disbursed');
        progressBar.style.width = '100%';
        subtitle.textContent = '💰 Success! Funds have been released to your account. You can now withdraw.';
    }

    // Update details
    const symbol = getCurrencySymbol(userCurrency);
    document.getElementById('loanDetails').innerHTML = `
        <h4 style="margin-bottom: 16px; font-size: 18px; color: var(--text-dark);">📋 Application Details</h4>
        <div style="display: grid; gap: 12px;">
            <div style="display: flex; justify-content: space-between; padding: 12px; background: var(--white); border-radius: 8px;">
                <span style="color: var(--text-muted);">Loan Amount</span>
                <strong style="color: var(--primary); font-size: 18px;">${symbol} ${loan.amount.toFixed(2)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 12px; background: var(--white); border-radius: 8px;">
                <span style="color: var(--text-muted);">Status</span>
                <strong style="color: ${loan.status === 'approved' || loan.status === 'disbursed' ? 'var(--success)' : 'var(--warning)'}; text-transform: uppercase;">${loan.status}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 12px; background: var(--white); border-radius: 8px;">
                <span style="color: var(--text-muted);">Applied</span>
                <strong>${new Date(loan.createdAt).toLocaleDateString()}</strong>
            </div>
            ${loan.approvedAt ? `
            <div style="display: flex; justify-content: space-between; padding: 12px; background: var(--white); border-radius: 8px;">
                <span style="color: var(--text-muted);">Approved</span>
                <strong>${new Date(loan.approvedAt).toLocaleDateString()}</strong>
            </div>
            ` : ''}
            ${loan.disbursedAt ? `
            <div style="display: flex; justify-content: space-between; padding: 12px; background: var(--white); border-radius: 8px;">
                <span style="color: var(--text-muted);">Disbursed</span>
                <strong>${new Date(loan.disbursedAt).toLocaleDateString()}</strong>
            </div>
            ` : ''}
        </div>
        ${loan.status === 'pending' ? `
            <div style="margin-top: 20px; padding: 16px; background: #FEF3C7; border-radius: 8px; border-left: 4px solid var(--warning);">
                <p style="font-size: 14px; color: #92400E;">
                    ⏳ <strong>Please wait</strong> - Our team is reviewing your application. You'll be notified once a decision is made.
                </p>
            </div>
        ` : ''}
        ${loan.status === 'approved' ? `
            <div style="margin-top: 20px; padding: 16px; background: #D1FAE5; border-radius: 8px; border-left: 4px solid var(--success);">
                <p style="font-size: 14px; color: #065F46;">
                    ✅ <strong>Approved!</strong> Waiting for admin to disburse funds to your account.
                </p>
            </div>
        ` : ''}
        ${loan.status === 'disbursed' ? `
            <div style="margin-top: 20px; padding: 16px; background: #D1FAE5; border-radius: 8px; border-left: 4px solid var(--success);">
                <p style="font-size: 14px; color: #065F46;">
                    💰 <strong>Funds Available!</strong> The loan amount has been credited to your account. You can now withdraw to your FNB account.
                </p>
            </div>
        ` : ''}
    `;
}


// FIX 5: CHECK FOR EXISTING LOAN ON LOAD
async function loadCustomerData() {
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    const userData = userDoc.data();
    userBalance = userData.balance || 0;
    
    updateBalance(userData.balance, userData.currency);
    updateKYCStatus(userData.kycVerified);

    // Load transactions
    const transactionsQuery = query(collection(db, 'transactions'), where('userId', '==', currentUser.uid));
    onSnapshot(transactionsQuery, (snapshot) => {
        const transactions = [];
        snapshot.forEach((doc) => {
            transactions.push({ id: doc.id, ...doc.data() });
        });
        transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        displayTransactions(transactions, userData.currency);
    });

    // Check for existing loan (but don't block new applications)
    const loansQuery = query(collection(db, 'loans'), where('userId', '==', currentUser.uid));
    const loansSnapshot = await getDocs(loansQuery);
    
    if (!loansSnapshot.empty) {
        // Get the most recent loan
        const loans = loansSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
        loans.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const latestLoan = loans[0];
        
        // Listen to the latest loan for updates
        onSnapshot(doc(db, 'loans', latestLoan.id), (doc) => {
            if (doc.exists() && currentLoanStatus) {
                updateLoanTracker(doc.data());
            }
        });
    }
}
EOF
cat /home/claude/fix-summary.md
