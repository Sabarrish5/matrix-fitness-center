function joinNow() {
  window.location.href = "register.html";
}

// ---------------------- Unified Registration & Login Logic (API) ----------------------
document.addEventListener('DOMContentLoaded', function() {
  // Toggle between normal and service registration
  const normalBtn = document.getElementById('normalBtn');
  const serviceBtn = document.getElementById('serviceBtn');
  const normalFields = document.getElementById('normalFields');
  const serviceFields = document.getElementById('serviceFields');

  if (normalBtn && serviceBtn) {
    normalBtn.onclick = function() {
      normalBtn.classList.add('active');
      serviceBtn.classList.remove('active');
      normalFields.style.display = '';
      serviceFields.style.display = 'none';
      if (document.getElementById('service')) document.getElementById('service').value = '';
    };
    serviceBtn.onclick = function() {
      serviceBtn.classList.add('active');
      normalBtn.classList.remove('active');
      normalFields.style.display = 'none';
      serviceFields.style.display = '';
      if (document.getElementById('membership')) document.getElementById('membership').value = '';
      if (document.getElementById('classType')) document.getElementById('classType').value = '';
      if (document.getElementById('classTime')) document.getElementById('classTime').value = '';
    };
  }

  // Registration
  const registrationForm = document.getElementById('registerForm');
  if (registrationForm) {
    registrationForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const membership = document.getElementById('membership') ? document.getElementById('membership').value : '';
      const classType = document.getElementById('classType') ? document.getElementById('classType').value : '';
      const classTime = document.getElementById('classTime') ? document.getElementById('classTime').value : '';
      const service = document.getElementById('service') ? document.getElementById('service').value : '';
      const msg = document.getElementById('registerMessage');

      // Validation
      if (!name || !email || !password || !phone) {
        msg.textContent = "All fields are required.";
        msg.style.color = "red";
        return;
      }
      if ((!membership || !classType || !classTime) && !service) {
        msg.textContent = "Please complete all registration details.";
        msg.style.color = "red";
        return;
      }

      const data = { name, email, password, phone, role: 'user' };
      if (service) {
        data.service = service;
      } else {
        data.membership = membership;
        data.classType = classType;
        data.classTime = classTime;
      }

      try {
        const res = await fetch('http://localhost:5000/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await res.json();
        if (res.ok) {
          msg.textContent = "Registration successful! You can now login.";
          msg.style.color = "#ff7300";
          setTimeout(() => window.location.href = "login.html", 1200);
        } else {
          msg.textContent = result.message || "Registration failed.";
          msg.style.color = "red";
        }
      } catch (err) {
        msg.textContent = "Server error!";
        msg.style.color = "red";
      }
    });
  }

  // Login
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const data = {
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value
      };
      const msg = document.getElementById('loginMessage');
      try {
        const res = await fetch('http://localhost:5000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await res.json();
        if (res.ok) {
          localStorage.setItem('currentUser', JSON.stringify(result));
          if (result.role === "admin") {
            window.location.href = "admin-dashboard.html";
          } else {
            window.location.href = "user-dashboard.html";
          }
        } else {
          msg.textContent = result.message || "Login failed.";
          msg.style.color = "red";
        }
      } catch (err) {
        msg.textContent = "Server error!";
        msg.style.color = "red";
      }
    });
  }

  // ---------------------- Admin Dashboard Logic ----------------------
  // Only run this if on admin-dashboard.html (check if admin table exists)
  if (document.getElementById('adminMemberTable')) {
    let workoutPlans = [];

    async function fetchWorkoutPlans() {
      const res = await fetch('http://localhost:5000/api/workoutplans');
      workoutPlans = await res.json();
    }

    async function loadMembers() {
      await fetchWorkoutPlans();
      const res = await fetch('http://localhost:5000/api/users');
      const users = await res.json();
      const memberList = document.getElementById('adminMemberList');
      memberList.innerHTML = '';
      if (users.length === 0) {
        memberList.innerHTML = '<tr><td colspan="9">No members registered yet.</td></tr>';
      } else {
        users.forEach(user => {
          const assignedPlan = user.workoutPlan ? user.workoutPlan.name : '<span style="color:#888;">None</span>';
          let planOptions = workoutPlans.map(plan => {
            return `<option value="${plan._id}" ${user.workoutPlan && user.workoutPlan._id === plan._id ? 'selected' : ''}>
              ${plan.name} [${plan.type === 'service' ? plan.related : plan.related}]
            </option>`;
          }).join('');
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${user.membership || ''}</td>
            <td>${user.service || ''}</td>
            <td>${user.classType || ''}</td>
            <td>${assignedPlan}</td>
            <td>
              <div class="assign-section">
                <select id="plan-${user.email}">
                  <option value="">-- Select Plan --</option>
                  ${planOptions}
                </select>
                <button onclick="assignPlan('${user.email}')" type="button">Assign</button>
              </div>
            </td>
            <td class="admin-actions">
              <button class="edit" onclick="editMember('${user._id}', '${user.name}', '${user.email}', '${user.phone}', '${user.membership || ''}')">Edit</button>
              <button class="delete" onclick="deleteMember('${user._id}')">Delete</button>
            </td>
          `;
          memberList.appendChild(tr);
        });
      }
    }

    window.assignPlan = async function(email) {
      const select = document.getElementById('plan-' + email);
      const planId = select.value;
      if (!planId) {
        alert("Please select a workout plan to assign.");
        return;
      }
      const res = await fetch(`http://localhost:5000/api/users/${email}/assign-workout`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workoutPlanId: planId })
      });
      const result = await res.json();
      if (res.ok) {
        alert("Workout plan assigned!");
        loadMembers();
      } else {
        alert(result.message || "Failed to assign workout plan.");
      }
    };

    window.editMember = function(id, name, email, phone, membership) {
      editingMemberId = id;
      document.getElementById('modalTitle').textContent = "Edit Member";
      document.getElementById('memberName').value = name;
      document.getElementById('memberEmail').value = email;
      document.getElementById('memberEmail').disabled = true;
      document.getElementById('memberPhone').value = phone;
      document.getElementById('memberMembership').value = membership;
      document.getElementById('memberPassword').value = '';
      document.getElementById('memberPassword').required = false;
      document.getElementById('memberModal').style.display = 'flex';
      document.getElementById('memberFormMsg').textContent = '';
    };

    window.deleteMember = async function(id) {
      if (!confirm("Are you sure you want to delete this member?")) return;
      try {
        const res = await fetch(`http://localhost:5000/api/users/${id}`, {
          method: 'DELETE'
        });
        const result = await res.json();
        if (res.ok) {
          loadMembers();
        } else {
          alert(result.message);
        }
      } catch (err) {
        alert("Server error!");
      }
    };

    // Modal logic
    window.showAddMemberForm = function() {
      editingMemberId = null;
      document.getElementById('modalTitle').textContent = "Add Member";
      document.getElementById('memberForm').reset();
      document.getElementById('memberEmail').disabled = false;
      document.getElementById('memberPassword').required = false;
      document.getElementById('memberModal').style.display = 'flex';
      document.getElementById('memberFormMsg').textContent = '';
    };

    window.hideMemberForm = function() {
      document.getElementById('memberModal').style.display = 'none';
    };

    let editingMemberId = null;
    if (document.getElementById('memberForm')) {
      document.getElementById('memberForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const data = {
          name: document.getElementById('memberName').value,
          email: document.getElementById('memberEmail').value,
          phone: document.getElementById('memberPhone').value,
          membership: document.getElementById('memberMembership').value,
          password: document.getElementById('memberPassword').value
        };
        const msg = document.getElementById('memberFormMsg');
        try {
          let res, result;
          if (editingMemberId) {
            res = await fetch(`http://localhost:5000/api/users/${editingMemberId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            result = await res.json();
          } else {
            res = await fetch('http://localhost:5000/api/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            result = await res.json();
          }
          if (res.ok) {
            msg.textContent = result.message;
            msg.style.color = "#ff7300";
            setTimeout(() => {
              hideMemberForm();
              loadMembers();
            }, 800);
          } else {
            msg.textContent = result.message;
            msg.style.color = "red";
          }
        } catch (err) {
          msg.textContent = "Server error!";
          msg.style.color = "red";
        }
      });
    }

    // Initial load
    loadMembers();
  }
});

// ---------------------- Logout Function (for dashboard pages) ----------------------
function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = "login.html";
}
