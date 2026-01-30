import { Car, Phone, MapPin, Edit, ExternalLink, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import AnatomyCardActions from "../../../components/anatomy/AnatomyCardActions";
import AnatomyText from "../../../components/anatomy/AnatomyText";
import type { Driver } from "../../../service/drivers.service";
import { STATUS } from "../../../config/status.config";
import AnatomySelect from "../../../components/anatomy/AnatomySelect";
import AnatomyTag from "../../../components/anatomy/AnatomyTag";


interface DriverCardProps {
  driver: Driver;
  onEdit: () => void;
  onViewDetails: () => void;
    onStatusChange: (status: string) => void;
}

const DriverCard = ({
  driver,
  onEdit,
  onViewDetails,onStatusChange}: DriverCardProps) => {
  const { t } = useTranslation();


  const avatarUrl = `https://ui-avatars.com/api/?name=${driver?.firstName}+${driver?.lastName}&background=random&color=fff`;

  return (
    <div className="bg-background-card p-6 rounded-3xl shadow-sm border border-border flex flex-col items-center text-center hover:shadow-md transition-all cursor-pointer group relative">
      <div className="w-20 h-20 rounded-full mb-4 border-2 border-background-card shadow-sm overflow-hidden group-hover:scale-105 transition-transform duration-300 ring-2 ring-gray-100 dark:ring-gray-700">
        <img
          src={driver.profileImageUrl || avatarUrl}
          alt={driver.firstName}
          className="w-full h-full object-cover"
        />
      </div>

      <AnatomyText.H3 className="text-lg mb-1">
        {driver.firstName} {driver.lastName}
      </AnatomyText.H3>

      <AnatomyTag className="mb-2" variant={driver.isAvailable ? 'success' : 'error'}>
        {driver.isAvailable? t('common.online'):t('common.offline')}
      </AnatomyTag>

    
      <div className="w-full border-t border-border pt-4 flex flex-col gap-3">
        <div className="flex  text-text-muted text-sm gap-2">
          <Mail className="w-4 h-4" />
          <span className="truncate max-w-[180px]">
            {driver.user.email || "No email provided"}
          </span>
        </div>

        <div className="flex text-text-muted text-sm gap-2">
          <Phone className="w-4 h-4" />
          <span className="truncate max-w-[180px]">
            {driver.phone || "No phone"}
          </span>
        </div>
        <div className="flex justify-center mt-1">
          <span
            className={`
    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border
    ${
      driver.status === "active"
        ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
        : "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
    }
  `}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${driver.status === STATUS.active ? "bg-green-500" : "bg-red-500"}`}
            ></span>
            {driver.status}
          </span>
        </div>

        <div className="pt-4 border-t border-border">
             <AnatomySelect
                label={t('drivers.status')}
                value={driver.status}
                onChange={(e) => onStatusChange(e.target.value)}
                className="mb-0" 
             >
                 <option value="active">{t('common.status_active')}</option>
                  <option value="inactive">{t('common.status_inactive')}</option>
                  <option value="suspended">{t('common.status_suspended')}</option>
             </AnatomySelect>
          </div>

        <AnatomyCardActions
          secondary={{
            label: t("common.edit"),
            icon: Edit,
            onClick: onEdit,
          }}
          primary={{
            label: t("common.details"),
            icon: ExternalLink,
            onClick: onViewDetails,
          }}
        />
      </div>
    </div>
  );
};

export default DriverCard;