import * as React from "react";
import { useNavigate } from 'react-router-dom';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import { Box, Button } from "@mui/material";
import FilterAltIcon from '@mui/icons-material/FilterAlt';

import { Filter } from "../../../../shared/components/filter/Filter";

interface OpcaoProps {
    Opcao1?: string;
    Opcao2?: string;
    Opcao3?: string;
    Opcao5?: string | null;

  }
  
interface BarraProps {
    opcoes: OpcaoProps;
    onFilterApply: (filter: string, dado: string | null) => void;
}

export const BarraAReceber: React.FC<BarraProps> = ({ opcoes, onFilterApply }) => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                m: 1,
                width: "auto",
                height: '30px',
                marginLeft: "8%",
                marginRight: "2%",
                padding: '2%',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                borderRadius: '8px'
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    ml: 'auto',
                }}
            >
                <Button
                    sx={{
                        backgroundColor: '#0d47a1',
                        color: 'white',
                        borderRadius: '6%',
                        width: 'auto',
                        minWidth: 120,
                        height: 28,
                        display: 'flex',
                        justifyContent: 'center',
                        fontSize: 10,
                        fontWeight: 'bold',
                        alignItems: 'center',
                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                        '&:hover': {
                            backgroundColor: '#0b3d91',
                        },
                    }}
                    onClick={() => navigate('/venda')}
                >
                    Vendas
                </Button>

                <Button
                    sx={{
                        backgroundColor: '#0d47a1',
                        color: 'white',
                        borderRadius: '6%',
                        width: 'auto',
                        minWidth: 120,
                        margin: '5px',
                        height: 28,
                        display: 'flex',
                        justifyContent: 'center',
                        fontSize: 10,
                        fontWeight: 'bold',
                        alignItems: 'center',
                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                        '&:hover': {
                            backgroundColor: '#0b3d91',
                        },
                    }}
                    onClick={() => navigate('/receber')}
                >
                    <LocalPrintshopIcon />
                </Button>


                <Filter opcoes={opcoes} onApplyFilter={onFilterApply} /> 
            </Box>
        </Box>
    );
};
