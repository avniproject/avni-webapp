ansible_exists := $(shell ansible-playbook --version)
ansible_check:
ifndef ansible_exists
		@echo "Ansible is not installed. Installing Ansible"
		brew install ansible
else
		@echo "Ansible is installed"
endif

install: ansible_check
	ansible-playbook setup/dev.yml -i setup/local

stop:
	@echo "Stopping httpd"
	httpd -k stop

run:
	@echo "Restarting HTTPD"
	httpd -k restart
