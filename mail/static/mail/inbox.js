document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');


  document.querySelector('#compose').onclick = () => {

    recipients = document.querySelector('#compose-recipients');
    subject = document.querySelector('#compose-subject');
    body = document.querySelector('#compose-body');
  };
});



function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //*******************************************************************************/
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then((emails) => {
    emails.forEach((element) => {
      if (mailbox != "sent") {
        sender_recipients = element.sender;
      } else {
        sender_recipients = element.recipients;
      }
      if (mailbox == "inbox") {
        if (element.read) {is_read = "read";}
        else {is_read = "";}
      } else {is_read = "read";}
      
      var item = document.createElement("div");
      item.className = `card ${is_read}`;
      
      item.innerHTML = `<div style="text-align: center" class="card-body" id="item-${element.id}">
      <div style="text-align: left; width: 30%; float: left">${element.subject}</div>
      <div style="text-align: left; width: 30%; display: inline-block; margin: 0 auto;">${sender_recipients}</div>
      <div style="text-align: left; width: 30%; float: right">${element.timestamp}</div>
      </div>`;
      document.querySelector('#emails-view').appendChild(item);
      item.addEventListener("click", () => {
        show_mail(element.id, mailbox);
      });
    });
  });
}

function show_mail(id, mailbox) {
  fetch(`emails/${id}`)
  .then(response => response.json())
  .then(email => {
    document.querySelector('#emails-view').innerHTML = "";
    var content = document.createElement("div");
    content.innerHTML = `<div class="card-body"> <b>From: </b> ${email.sender}
    <br>
    <b>To: </b> ${email.recipients}
    <br>
    <b>Subject: </b> ${email.subject}
    <br>
    <b>Time: </b> ${email.timestamp}
    <br><br>
    <hr>
    ${email.body}
    <hr>
    <div style = "position: relative; float: left; margin-right:10px;" id="reply-btn"></div>
    <div style = "position: relative; float: left; margin-right:10px;" id="archive-btn"></div>
    <br>
    </div>
    </div>`;
    document.querySelector('#emails-view').appendChild(content);
    if(mailbox === 'sent') {
      return;
    }
    let archive = document.createElement('btn');
    archive.className = 'btn btn-warning';
    if(email.archived){
      archive.textContent = "Unarchive";
    } else {
      archive.textContent = "Archive";
    }
    archive.addEventListener('click', () => {
      toggle_archive(email.id,email.archived);
    });
    document.querySelector('#archive-btn').append(archive);

    let reply = document.createElement('btn');
    reply.className = 'btn btn-success';
    reply.textContent = 'reply';
    reply.addEventListener('click', () => {
      mail_reply(email);
    });
    document.querySelector('#reply-btn').append(reply);
    to_read(email.id);
  });
}

function mail_reply(email) {
  compose_email();
  document.querySelector('#compose-recipients').value = `${email.sender}`;
  document.querySelector('#compose-subject').value = `${email.subject}`;
  document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body} \n<end of message>\n`;
}

function to_read(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
}

function toggle_archive(id, state) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: !state
    })
  })
  window.location.reload();
}


document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('#compose-form');
  const msg = document.querySelector('#message');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    to = document.querySelector('#compose-recipients');
    subject = document.querySelector('#compose-subject');
    body = document.querySelector('#compose-body');
    
    if (form.length ==0 && to.length == 0) return;

    fetch("/emails", {
      method: 'POST',
      body: JSON.stringify({
        recipients: to.value,
        subject: subject.value,
        body: body.value,
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        console.log(result.message);
        if (result.message == 'Email sent successfully.') {
          load_mailbox("sent");
        } else {
          msg.innerHTML = `<div class="alert alert-danger" role="alert">
          ${result.error}
        </div>`;
        }
      });
  });
},
false
);



  //************************************************************************************************
