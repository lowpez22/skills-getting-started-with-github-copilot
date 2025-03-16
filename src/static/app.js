document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Fetch and display activities
  function loadActivities() {
    fetch("/activities")
      .then(response => response.json())
      .then(data => {
        activitiesList.innerHTML = "";
        activitySelect.innerHTML = "<option value=''>-- Select an activity --</option>";
        
        for (const [activityName, activity] of Object.entries(data)) {
          // Create activity card for the activities list
          const activityCard = document.createElement("div");
          activityCard.className = "activity-card";
          
          // Add activity details
          activityCard.innerHTML = `
            <h4>${activityName}</h4>
            <p>${activity.description}</p>
            <p><strong>Schedule:</strong> ${activity.schedule}</p>
            <p><strong>Availability:</strong> ${activity.participants.length}/${activity.max_participants} participants</p>
          `;
          
          // Add participants section
          if (activity.participants.length > 0) {
            const participantsSection = document.createElement("div");
            participantsSection.className = "participants-section";
            
            const participantsTitle = document.createElement("div");
            participantsTitle.className = "participants-title";
            participantsTitle.textContent = `Participants (${activity.participants.length}):`;
            participantsSection.appendChild(participantsTitle);
            
            const participantsList = document.createElement("ul");
            participantsList.className = "participants-list";
            
            activity.participants.forEach(email => {
              const li = document.createElement("li");
              li.textContent = email;
              participantsList.appendChild(li);
            });
            
            participantsSection.appendChild(participantsList);
            activityCard.appendChild(participantsSection);
          }
          
          activitiesList.appendChild(activityCard);
          
          // Add activity to the select dropdown
          const option = document.createElement("option");
          option.value = activityName;
          option.textContent = activityName;
          activitySelect.appendChild(option);
        }
      })
      .catch(error => {
        activitiesList.innerHTML = "<p>Error loading activities. Please try again later.</p>";
        console.error("Error fetching activities:", error);
      });
  }

  // Handle form submission
  signupForm.addEventListener("submit", function(e) {
    e.preventDefault();
    
    const email = document.getElementById("email").value;
    const activity = activitySelect.value;
    
    if (!email || !activity) {
      showMessage("Please fill out all fields", "error");
      return;
    }
    
    fetch(`/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`, {
      method: "POST"
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => { throw new Error(err.detail || "Failed to sign up"); });
      }
      return response.json();
    })
    .then(data => {
      showMessage(data.message, "success");
      loadActivities(); // Refresh the activities
      signupForm.reset();
    })
    .catch(error => {
      showMessage(error.message, "error");
      console.error("Error signing up:", error);
    });
  });

  // Show message function
  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove("hidden");
    
    // Hide the message after 5 seconds
    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  // Initial load
  loadActivities();
});
