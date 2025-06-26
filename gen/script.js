
        document.addEventListener('DOMContentLoaded', function() {
            const segments = document.querySelectorAll('.canvas-segment');
            const businessDescription = document.getElementById('businessDescription');
            const generateBtn = document.getElementById('generateBtn');
            const printBtn = document.getElementById('printBtn');
            const generatingIndicator = document.getElementById('generatingIndicator');
            
            // Sample AI responses for each segment based on context
            const aiResponses = {
                "key-partnerships": [
                    "• Strategic alliance with cloud service providers\n• Partnership with payment gateway providers\n• Collaboration with marketing agencies\n• Supply chain partnerships with hardware manufacturers\n• Academic institutions for research and talent",
                    "• Distribution partnerships with retail chains\n• Manufacturing outsourcing agreements\n• Joint ventures with complementary tech companies\n• API integration partnerships\n• Logistics and fulfillment partners",
                    "• Industry association memberships\n• Co-branding partnerships\n• R&D collaborations\n• Supplier relationships for raw materials\n• Strategic investors and advisors"
                ],
                "key-activities": [
                    "• Product development and innovation\n• Platform maintenance and updates\n• Customer acquisition and retention\n• Supply chain management\n• Quality assurance and testing",
                    "• Content creation and curation\n• Algorithm development and optimization\n• User community management\n• Market research and analysis\n• Training and support services",
                    "• Manufacturing and production\n• Distribution and logistics\n• Customer service excellence\n• Continuous process improvement\n• Intellectual property management"
                ],
                "key-resources": [
                    "• Proprietary technology and algorithms\n• Talented development team\n• Customer data and insights\n• Brand reputation and recognition\n• Intellectual property portfolio",
                    "• Physical infrastructure and equipment\n• Distribution network\n• Capital and funding\n• Strategic partnerships\n• Customer relationships and loyalty",
                    "• Specialized knowledge and expertise\n• Scalable technology platform\n• User community and network effects\n• Patents and trademarks\n• Operational processes and systems"
                ],
                "value-propositions": [
                    "• Streamlined workflow automation\n• Cost reduction through efficiency\n• Personalized user experience\n• Time-saving solutions\n• Enhanced data security and privacy",
                    "• Superior quality and performance\n• Innovative features and functionality\n• Seamless integration capabilities\n• Customization and flexibility\n• Exceptional customer support",
                    "• Sustainable and eco-friendly solutions\n• Accessibility and inclusivity\n• Cutting-edge technology advantage\n• Simplified complex processes\n• Comprehensive all-in-one platform"
                ],
                "customer-relationships": [
                    "• Self-service portal with knowledge base\n• Dedicated account managers for enterprise clients\n• Community forums and user groups\n• Automated onboarding and tutorials\n• 24/7 customer support",
                    "• Co-creation and feedback loops\n• Loyalty programs and incentives\n• Personalized communication\n• Regular check-ins and reviews\n• Educational webinars and resources",
                    "• Transparent communication channels\n• User testing and beta programs\n• Social media engagement\n• Customer success stories and case studies\n• Proactive issue resolution"
                ],
                "customer-segments": [
                    "• Small to medium-sized businesses\n• Enterprise corporations\n• Tech-savvy professionals\n• Remote and distributed teams\n• Industry-specific verticals (healthcare, finance, etc.)",
                    "• Startups and entrepreneurs\n• Educational institutions\n• Government agencies\n• Non-profit organizations\n• International markets with localization needs",
                    "• Creative professionals and agencies\n• E-commerce businesses\n• Mobile-first users\n• Data-driven organizations\n• Subscription-based consumers"
                ],
                "cost-structure": [
                    "• Software development and engineering\n• Cloud infrastructure and hosting\n• Marketing and customer acquisition\n• Employee salaries and benefits\n• Research and development",
                    "• Sales and distribution channels\n• Customer support operations\n• Licensing and compliance costs\n• Office space and equipment\n• Training and professional development",
                    "• Manufacturing and production\n• Inventory management\n• Quality assurance processes\n• Intellectual property protection\n• Partnership and integration costs"
                ],
                "channels": [
                    "• Direct website and mobile app\n• Inside sales team\n• Partner referral network\n• Content marketing and SEO\n• Social media platforms",
                    "• Email marketing campaigns\n• Industry conferences and events\n• Affiliate marketing programs\n• App stores and marketplaces\n• Webinars and virtual demos",
                    "• Retail distribution\n• Free trial and freemium model\n• Strategic partnerships\n• Customer referral program\n• Targeted online advertising"
                ],
                "revenue-streams": [
                    "• Subscription-based pricing tiers\n• Usage-based pricing model\n• Freemium with premium features\n• Enterprise licensing agreements\n• Professional services and implementation",
                    "• Transaction fees and commissions\n• Data monetization (anonymized insights)\n• White-label solutions\n• API access and integration fees\n• Add-on features and extensions",
                    "• One-time purchases\n• Maintenance and support contracts\n• Training and certification programs\n• Advertising and sponsorships\n• Marketplace commissions"
                ]
            };

            // Check if any segment has content
            function checkForContent() {
                let hasContent = false;
                
                // Check business description
                if (businessDescription.value.trim() !== '') {
                    hasContent = true;
                }
                
                // Check all segments
                segments.forEach(segment => {
                    const textarea = segment.querySelector('textarea');
                    if (textarea.value.trim() !== '') {
                        hasContent = true;
                        segment.classList.add('active');
                        const toggleContainer = segment.querySelector('.toggle-container');
                        if (toggleContainer) toggleContainer.classList.remove('hidden');
                    } else {
                        segment.classList.remove('active');
                        const toggleContainer = segment.querySelector('.toggle-container');
                        if (toggleContainer) toggleContainer.classList.add('hidden');
                    }
                });
                
                generateBtn.classList.toggle('hidden', !hasContent);
            }

            // Initialize event listeners for textareas
            segments.forEach(segment => {
                const textarea = segment.querySelector('textarea');
                textarea.addEventListener('input', checkForContent);
                
                // Setup freeze toggle functionality
                const freezeToggle = segment.querySelector('.freeze-toggle');
                
                if (freezeToggle) {
                    freezeToggle.addEventListener('change', function() {
                        segment.classList.toggle('frozen', this.checked);
                    });
                }
            });
            
            // Add event listener for business description
            businessDescription.addEventListener('input', checkForContent);

            // Generate button functionality
            generateBtn.addEventListener('click', function() {
                // Show generating indicator
                generatingIndicator.classList.remove('hidden');
                generateBtn.classList.add('hidden');
                
                // Simulate AI processing time
                setTimeout(() => {
                    segments.forEach(segment => {
                        const segmentType = segment.getAttribute('data-segment');
                        const textarea = segment.querySelector('textarea');
                        const freezeToggle = segment.querySelector('.freeze-toggle');
                        
                        // Skip if segment is frozen
                        if (freezeToggle && freezeToggle.checked) {
                            return;
                        }
                        
                        // Skip if this is the segment that was filled by the user
                        if (textarea.value.trim() !== '' && segment.classList.contains('active')) {
                            return;
                        }
                        
                        // Generate content for empty segments
                        if (textarea.value.trim() === '') {
                            const responses = aiResponses[segmentType];
                            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                            textarea.value = randomResponse;
                            
                            // Highlight newly generated content
                            segment.classList.add('active');
                            segment.classList.add('pulse-animation');
                            setTimeout(() => {
                                segment.classList.remove('pulse-animation');
                            }, 2000);
                            
                            // Show freeze toggle
                            const toggleContainer = segment.querySelector('.toggle-container');
                            if (toggleContainer) toggleContainer.classList.remove('hidden');
                        }
                    });
                    
                    // Hide generating indicator and show generate button again
                    generatingIndicator.classList.add('hidden');
                    generateBtn.classList.remove('hidden');
                }, 1500);
            });

            // Print button functionality
            printBtn.addEventListener('click', function() {
                window.print();
            });
        });
    

(function(){function c(){var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'954d9e8694b2a45b',t:'MTc1MDc4MjcyNi4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();