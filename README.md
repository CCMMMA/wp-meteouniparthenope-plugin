# wp-meteouniparthenope
 The repository of meteo.uniparthenope.it WordPress plugin!

# Installation
Create the directory in which you will download the repository.

Download the repository and run the `docker-compose` file with `docker-compose up`, it will create a WordPress container. At the end it will create a `wp_data` directory (NOTE: make sure to change the values inside the `.env` files with your own)

When the container is ready, open your browser and search `localhost:8000`, then follow the steps for configure the WordPress site.

Copy or move the `meteo-plugin` directory into `wp_data/wp-content/plugins`.

Copy or move the `news-magazine-x-child` directory into `wp_data/wp-content/themes`.

Go to the WordPress admin dashboard (`localhost:8000/wp-admin`) and then go to the plugin tab.

Activate the plugin!

Possible problems may be related to permissions on the directories created by the container, change the permission on them.
