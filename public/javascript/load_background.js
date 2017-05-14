var images = ['/background_images/the-blueprint.jpg', '/background_images/ready_to_die.jpg', '/background_images/tupac.jpg'];

 $('body').css({'background-image': 'url(images/' + images[Math.floor(Math.random() * images.length)] + ')'});

/*
background-image: url(/background_images/the-blueprint.jpg);
background-color: #FFFFFF;
background-attachment: fixed !important;

background: -moz-linear-gradient(top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.7) 100%), url(bg.png) no-repeat 0 0, url(/background_images/the-blueprint.jpg) repeat 0 0;
background: -moz-linear-gradient(top, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.7) 100%), url(/background_images/the-blueprint.jpg) no-repeat 0 0;
background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,rgba(255,255,255,0.7)), color-stop(100%,rgba(255,255,255,0.7))), url(/background_images/the-blueprint.jpg) no-repeat 0 0;
background: -webkit-linear-gradient(top, rgba(255,255,255,0.7) 0%,rgba(255,255,255,0.7) 100%), url(/background_images/the-blueprint.jpg) no-repeat 0 0;
background: -o-linear-gradient(top, rgba(255,255,255,0.7) 0%,rgba(255,255,255,0.7) 100%), url(/background_images/the-blueprint.jpg) no-repeat 0 0;
background: -ms-linear-gradient(top, rgba(255,255,255,0.7) 0%,rgba(255,255,255,0.7) 100%), url(/background_images/the-blueprint.jpg) no-repeat 0 0;
background: linear-gradient(to bottom, rgba(255,255,255,0.7) 0%,rgba(255,255,255,0.7) 100%), url(/background_images/the-blueprint.jpg) no-repeat 0 0;



-webkit-background-size: cover;
-moz-background-size: cover;
-o-background-size: cover;
background-size: cover;*/