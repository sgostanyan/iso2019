#!/bin/bash

# Help menu
print_help() {
cat <<-HELP
This script is used to fix permissions of a Drupal installation
you need to provide the following arguments:

  1) Path to your Drupal root installation.
  2) Path to your Drupal web installation.
  3) Username of the user that you want to give files/directories ownership.
  4) HTTPD group name.

Usage: (sudo) bash ${0##*/} --drupal_root_project_path=PATH --drupal_web_path=PATH --drupal_user=USER --httpd_group=GROUP
Example: (sudo) bash ${0##*/} --drupal_root_project_path=/usr/local/apache2/htdocs --drupal_path=/usr/local/apache2/htdocs/web --drupal_user=john --httpd_group=www-data
HELP
exit 0
}

if [ $(id -u) != 0 ]; then
  printf "**************************************\n"
  printf "* Error: You must run this with sudo or root*\n"
  printf "**************************************\n"
  print_help
  exit 1
fi
drupal_root_path=${1%/}
drupal_web_path=${2%/}
drupal_user=${3}
httpd_group=${4}

# Parse Command Line Arguments
while [ "$#" -gt 0 ]; do
  case "$1" in
    --drupal_root_project_path=*)
        drupal_root_project_path="${1#*=}"
        ;;
    --drupal_web_path=*)
        drupal_web_path="${1#*=}"
        ;;
    --drupal_user=*)
        drupal_user="${1#*=}"
        ;;
    --httpd_group=*)
        httpd_group="${1#*=}"
        ;;
    --help) print_help;;
    *)
      printf "***********************************************************\n"
      printf "* Error: Invalid argument, run --help for valid arguments. *\n"
      printf "***********************************************************\n"
      exit 1
  esac
  shift
done

if [ -z "${drupal_web_path}" ] || [ ! -d "${drupal_web_path}/sites" ] || [ ! -f "${drupal_web_path}/core/modules/system/system.module" ] && [ ! -f "${drupal_web_path}/modules/system/system.module" ]; then
  printf "*********************************************\n"
  printf "* Error: Please provide a valid Drupal path. *\n"
  printf "*********************************************\n"
  print_help
  exit 1
fi

if [ -z "${drupal_user}" ] || [[ $(id -un "${drupal_user}" 2> /dev/null) != "${drupal_user}" ]]; then
  printf "*************************************\n"
  printf "* Error: Please provide a valid user. *\n"
  printf "*************************************\n"
  print_help
  exit 1
fi

cd $drupal_root_project_path
printf "Changing ownership of all contents of "${drupal_root_project_path}":\n user => "${drupal_user}" \t group => "${httpd_group}"\n"
chown -R ${drupal_user}:${httpd_group} ${drupal_root_project_path}

printf "Changing permissions of all directories inside "${drupal_root_project_path}" to "rwxr-x---"...\n"
#find . -type d -exec chmod u=rwx,g=rx,o= '{}' \;
chmod -R 750 ${drupal_root_project_path}

#cd $drupal_web_path
#printf "Changing ownership of all contents of "${drupal_web_path}":\n user => "${drupal_user}" \t group => "${httpd_group}"\n"
#chown -R ${drupal_user}:${httpd_group} .

#printf "Changing permissions of all directories inside "${drupal_web_path}" to "rwxr-x---"...\n"
#find . -type d -exec chmod u=rwx,g=rx,o= '{}' \;

#printf "Changing permissions of all files inside "${drupal_web_path}" to "rw-r-----"...\n"
#find . -type f -exec chmod u=rw,g=r,o= '{}' \;

#printf "Changing permissions of "files" directories in "${drupal_web_path}/sites" to "r--r-----"...\n"
#cd sites
#find . -type d -name files -exec chmod ug=r,o= '{}' \;

printf "Changing permissions of "settings files" directories in "${drupal_web_path}/sites/*/se*" to "r--r-----"...\n"
find ${drupal_web_path}/sites/*/se* -type f -exec chmod 440 '{}' \;

printf "Changing permissions of all files inside all "files" directories in "${drupal_web_path}/sites/*/files" to "rwxrwxrwx"...\n"
chmod -R 777 ${drupal_web_path}/sites/*/files

#printf "Changing permissions of all files inside all "files" directories in "${drupal_web_path}/sites" to "rw-rw----"...\n"
#printf "Changing permissions of all directories inside all "files" directories in "${drupal_web_path}/sites" to "rwxrwx---"...\n"
#for x in ./*/files; do
#  find ${x} -type d -exec chmod ug=rwx,o= '{}' \;
#  find ${x} -type f -exec chmod ug=rw,o= '{}' \;
#done
echo "Done setting proper permissions on files and directories"