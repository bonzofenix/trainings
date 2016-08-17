Vagrant.configure('2') do |config|
  config.vm.box = 'cloudfoundry/bosh-lite'

  config.vm.provider :virtualbox do |v, override|
    override.vm.box_version = '2811'
    # To use a different IP address for the bosh-lite director, uncomment this line:
    # override.vm.network :private_network, ip: '192.168.59.4', id: :local
  end

  [:vmware_fusion, :vmware_desktop, :vmware_workstation].each do |provider|
    config.vm.provider provider do |v, override|
      override.vm.box_version = '388'
      # To use a different IP address for the bosh-lite director, uncomment this line:
      # override.vm.network :private_network, ip: '192.168.54.4', id: :local
    end
  end

  ENV['NUMBER_OF_BOSHES'] ||= '1'
  ENV['NUMBER_OF_BOSHES'].strip.to_i.times do |i|
    ENV['BOSH_LITE_NAME'] = vm_name = "bosh-lite-#{i}"
    config.vm.define vm_name do |workstation|
      config.vm.provider :aws do |v, override|
        override.vm.box_version = '2811'
        # To turn off public IP echoing, uncomment this line:
        # override.vm.provision :shell, id: "public_ip", run: "always", inline: "/bin/true"

        # To turn off CF port forwarding, uncomment this line:
        # override.vm.provision :shell, id: "port_forwarding", run: "always", inline: "/bin/true"
      end
    end
  end
end
